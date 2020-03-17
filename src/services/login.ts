import request, { MethodEnum, RestApiPromise, RestApiResult } from '@/utils/request';
import { Account } from "@/models/login";

export interface LoginParamsType {
  userName: string;
  password: string;
  autoLogin: boolean
}

export async function accountLogin(params: LoginParamsType): RestApiPromise<Account> {
  return request('/apis/user/account/login.json', {
    method: MethodEnum.POST,
    data: params,
    failedTitle: "登录失败"
  });
}

export async function accountLogout(): Promise<RestApiResult<string>> {
  return request('/apis/user/account/logout.json');
}

export async function queryCurrentUser(): RestApiPromise<Account> {
  return request('/apis/user/account/current.json');
}
