import request, { MethodEnum, RestApiPromise, RestApiResult } from '@/utils/request';
import { Account } from '@/models/login';
import { md5, sha1 } from 'hefang-js';

export interface LoginParamsType {
  userName: string;
  password: string;
  autoLogin: boolean;
}

export async function accountLogin(params: LoginParamsType): RestApiPromise<Account> {
  return request('/apis/user/account/login.json', {
    method: MethodEnum.POST,
    data: params,
    failedTitle: '登录失败',
  });
}

export async function accountLockScreen(lock: boolean, password?: string): RestApiPromise<Account> {
  return request(`/apis/user/account/screen/${lock ? 'lock' : 'unlock'}.json`, {
    method: MethodEnum.POST,
    data: {
      password: sha1(password as string) + md5(password as string),
    },
  });
}

export async function accountLogout(): Promise<RestApiResult<string>> {
  return request('/apis/user/account/logout.json');
}

export async function queryCurrentUser(): RestApiPromise<Account> {
  return request('/apis/user/account/current.json');
}

export async function heartbeat(): RestApiPromise<string[]> {
  return request('/apis/user/account/heartbeat.json');
}
