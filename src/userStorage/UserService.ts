/**
 * Copyright 2018-2020 Symlink GmbH
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * 
 */




import { STORAGE_TYPES, storageContainer, StaticQueryProtector, AbstractBindings } from "@symlinkde/eco-os-pk-storage";
import { bootstrapperContainer } from "@symlinkde/eco-os-pk-core";
import Config from "config";
import { User } from "./User";
import { PkStroageUser, PkStorage, MsUser } from "@symlinkde/eco-os-pk-models";
import { injectable } from "inversify";
import { IApiKey } from "@symlinkde/eco-os-pk-models/lib/models/services/ms_user/IApiKey";

@injectable()
export class UserService extends AbstractBindings implements PkStroageUser.IUserService {
  private userRepro: PkStorage.IMongoRepository<User>;

  public constructor() {
    super(storageContainer);

    this.initDynamicBinding(
      [STORAGE_TYPES.Database, STORAGE_TYPES.Collection, STORAGE_TYPES.StorageTarget],
      [Config.get("mongo.db"), Config.get("mongo.collection"), "SECONDLOCK_MONGO_USER_DATA"],
    );

    this.initStaticBinding(
      [STORAGE_TYPES.SECONDLOCK_REGISTRY_URI],
      [bootstrapperContainer.get("SECONDLOCK_REGISTRY_URI")],
    );

    this.userRepro = this.getContainer().getTagged<PkStorage.IMongoRepository<User>>(
      STORAGE_TYPES.IMongoRepository,
      STORAGE_TYPES.STATE_LESS,
      false,
    );
  }

  public async createUser(user: MsUser.IUser): Promise<User> {
    const convUser = user;
    convUser.email = convUser.email.trim().toLocaleLowerCase();
    const userInstance: User = new User(convUser);
    const objectId = await this.userRepro.create(userInstance);
    userInstance.setId(objectId);
    return userInstance;
  }

  public async loadUserById(id: string): Promise<User | null> {
    const result = await this.userRepro.findOne(id);
    if (result === null) {
      return result;
    }

    return new User(<MsUser.IUser>result);
  }

  public async loadAllUsers(): Promise<Array<User> | null> {
    const result = await this.userRepro.find({});

    if (result === null) {
      return result;
    }

    return result.map((user) => new User(user));
  }

  public async deleteUserById(id: string): Promise<boolean> {
    return await this.userRepro.delete(id);
  }

  public async updateUserById<T>(id: string, item: T): Promise<boolean> {
    return await this.userRepro.update<T>(id, item);
  }

  public async loadUserByEmail(email: string): Promise<Array<User> | null> {
    const result = await this.userRepro.find({ email: email.trim().toLocaleLowerCase() });

    if (result === null) {
      return result;
    }

    return result.map((user) => new User(user));
  }

  public async loadUserByForgotPasswordId(forgotPasswordId: string): Promise<User | null> {
    const result = await this.userRepro.find({ forgotPasswordId });

    if (result === null) {
      return null;
    }

    return result.map((user) => new User(user))[0];
  }

  public async loadUserByActivationId(activationId: string): Promise<User | null> {
    const result = await this.userRepro.find({ activationId });

    if (result === null) {
      return null;
    }

    return result.map((user) => new User(user))[0];
  }

  public async loadUserByDeleteId(deleteId: string): Promise<User | null> {
    const result = await this.userRepro.find({ deleteId });

    if (result === null) {
      return null;
    }

    return result.map((user) => new User(user))[0];
  }

  public async searchUsers(query: string): Promise<Array<User> | null> {
    const result = await this.userRepro.find({
      email: {
        $regex: `.*${StaticQueryProtector.filter(query)
          .trim()
          .toLocaleLowerCase()}.*`,
      },
    });

    if (result === null) {
      return null;
    }

    return result.map((user) => new User(user));
  }

  public async getCountFromActivatedUsers(): Promise<number> {
    const result = await this.userRepro.find({
      isActive: true,
    });

    if (result === null) {
      return 0;
    }

    return result.length - 1;
  }

  public async loadUserByApiKey(apiKey: string): Promise<MsUser.IUser | null> {
    const result = await this.userRepro.find({
      "apiKeys.key": apiKey,
    });

    if (result === null) {
      return null;
    }

    if (result.length > 0) {
      result[0].apiKeys.map((apikeyObject: any) => {
        if (apikeyObject.key === apiKey) {
          if (
            apikeyObject.expireDate !== undefined &&
            apikeyObject.expireDate !== null &&
            new Date(apikeyObject.expireDate) < new Date()
          ) {
            throw new Error("apikey expire execption");
          }
        }
      });
    }

    return result[0];
  }

  public async addApiKeyToUser(id: string, key: IApiKey): Promise<MsUser.IUser | null> {
    const result = await this.userRepro.findOne(id);
    if (result === null) {
      return result;
    }

    if (key.expireDate !== undefined && key.expireDate !== null) {
      key.expireDate = new Date(key.expireDate);
    }

    if (result.apiKeys === undefined) {
      result.apiKeys = [key];
      await this.userRepro.update(id, result);
      return result;
    }

    const apiKeys = [...result.apiKeys];
    apiKeys.push(key);
    result.apiKeys = apiKeys;

    await this.userRepro.update(id, result);
    return result;
  }

  public async removeApiKeyFromUser(id: string, apiKey: string): Promise<MsUser.IUser | null> {
    const result = await this.userRepro.findOne(id);
    if (result === null) {
      return result;
    }

    if (result.apiKeys === undefined) {
      return result;
    }

    const apiKeys: Array<any> = [...result.apiKeys];
    for (const index in apiKeys) {
      if (apiKeys[index].key === apiKey) {
        apiKeys.splice(Number(index), 1);
      }
    }

    result.apiKeys = apiKeys;
    await this.userRepro.update(id, result);
    return result;
  }

  public async removeAllApiKeysFromUser(id: string): Promise<boolean> {
    const result = await this.userRepro.findOne(id);
    if (result === null) {
      return false;
    }
    result.apiKeys = [];
    await this.userRepro.update(id, result);
    return true;
  }

  public async addAliasToUser(id: string, alias: string): Promise<MsUser.IUser | null> {
    const result = await this.userRepro.findOne(id);
    if (result === null) {
      return result;
    }

    if (result.alias === undefined) {
      result.alias = [alias];
      await this.userRepro.update(id, result);
      return result;
    }

    const aliases = [...result.alias];
    for (const i in aliases) {
      if (aliases[i] === alias) {
        return result;
      }
    }

    aliases.push(alias);
    result.alias = aliases;

    await this.userRepro.update(id, result);
    return result;
  }

  public async loadUserByAlias(alias: string): Promise<MsUser.IUser | null> {
    const result = await this.userRepro.find({
      alias,
    });

    if (result === null) {
      return null;
    }

    return result[0];
  }

  public async removeAliasFromUser(id: string, alias: string): Promise<MsUser.IUser | null> {
    const result = await this.userRepro.findOne(id);
    if (result === null) {
      return result;
    }

    if (result.alias === undefined) {
      return result;
    }

    const aliases: Array<string> = [...result.alias];
    for (const index in aliases) {
      if (aliases[index] === alias) {
        aliases.splice(Number(index), 1);
      }
    }

    result.alias = aliases;
    await this.userRepro.update(id, result);
    return result;
  }
}
