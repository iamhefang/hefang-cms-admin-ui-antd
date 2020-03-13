import request, { RestApiResult } from '@/utils/request';
import { Account } from "@/models/login";

export interface LoginParamsType {
  userName: string;
  password: string;
  mobile: string;
  captcha: string;
}

export async function accountLogin(params: LoginParamsType): Promise<RestApiResult<Account>> {
  console.log(params);
  return request('/apis/user/account/login.json', {
    method: 'POST',
    data: params,
    failedTitle: "登录失败"
  });
}

export async function accountLogout(): Promise<RestApiResult<string>> {
  return request('/apis/user/account/logout.json');
}

export async function getFakeCaptcha(mobile: string) {
  return request(`/api/login/captcha?mobile=${mobile}`);
}

export async function queryCurrentMenus(): Promise<any> {
  return request("/apis/user/account/menus.json")
}

export async function queryCurrentUser(): Promise<any> {
  return request('/apis/user/account/current.json');
}
