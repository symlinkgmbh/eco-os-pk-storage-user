/**
 * Copyright 2018-2019 Symlink GmbH
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



import { MsUser } from "@symlinkde/eco-os-pk-models";
import { IApiKey } from "@symlinkde/eco-os-pk-models/lib/models/services/ms_user/IApiKey";

export class User implements MsUser.IUser {
  public email: string;
  public password: string;
  public _id?: string;
  public forgotPasswordId?: string;
  public acl: MsUser.IUserRole;
  public activationId: string;
  public isActive: boolean;
  public loginErrorCounter: number;
  public accountLockTime?: Date | null;
  public deleteId: string;
  public otp: string | null;
  public lastPasswordHash: string | null;
  public apiKeys: Array<IApiKey>;
  public hasEulaAccepted: boolean;
  public alias?: Array<string>;

  // tslint:disable-next-line:cyclomatic-complexity
  constructor(user: MsUser.IUser) {
    this.email = user.email;
    this.password = user.password;
    this.acl = user.acl;
    this.forgotPasswordId = user.forgotPasswordId === undefined || null || "" ? "" : user.forgotPasswordId;
    this._id = user._id;
    this.activationId = user.activationId;
    this.isActive = user.isActive;
    this.loginErrorCounter = user.loginErrorCounter;
    this.accountLockTime = user.accountLockTime;
    this.deleteId = user.deleteId;
    this.otp = user.otp === undefined ? null : user.otp;
    this.lastPasswordHash = user.lastPasswordHash === undefined ? null : user.lastPasswordHash;
    this.apiKeys = user.apiKeys === undefined ? [] : user.apiKeys;
    this.hasEulaAccepted = user.hasEulaAccepted === undefined ? false : user.hasEulaAccepted;
    this.alias = user.alias === undefined ? [] : user.alias;
  }

  public getEmail(): string {
    return this.email;
  }

  public setEmail(email: string): void {
    this.email = email;
  }

  public getPassword(): string {
    return this.password;
  }

  public setPassword(password: string): void {
    this.password = password;
    return;
  }

  public getId(): string {
    if (!this._id) {
      return "";
    }
    return this._id;
  }

  public setId(id: string): void {
    this._id = id;
  }

  public getForgotPasswordId(): string {
    if (!this.forgotPasswordId) {
      return "";
    }

    return this.forgotPasswordId;
  }

  public setForgotPasswordId(id: string): void {
    this.forgotPasswordId = id;
    return;
  }

  public getAcl(): MsUser.IUserRole {
    return this.acl;
  }

  public setAcl(acl: MsUser.IUserRole): void {
    this.acl = acl;
    return;
  }

  public getActivationId(): string {
    return this.activationId;
  }

  public setActivationId(id: string): void {
    this.activationId = id;
    return;
  }

  public getIsActive(): boolean {
    return this.isActive;
  }

  public setIsActive(status: boolean): void {
    this.isActive = status;
    return;
  }

  public getLoginErrorAccount(): number {
    return this.loginErrorCounter;
  }

  public setLoginErrorAccount(counter: number): void {
    this.loginErrorCounter = counter;
    return;
  }

  public getAccountLockTime(): Date | null {
    return this.accountLockTime === undefined ? null : this.accountLockTime;
  }

  public setAccountLockTime(time: Date | null): void {
    this.accountLockTime = time;
    return;
  }

  public getOtp(): string | null {
    return this.otp;
  }

  public setOtop(otp: string | null): void {
    this.otp = otp;
    return;
  }
}
