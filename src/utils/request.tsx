import React from 'react';
import _ from 'lodash';
import { chainingCheck } from 'hefang-js';
import { message, notification } from 'antd';
import { getSessionStorage } from 'useful-storage';
import { Account } from '@/models/login';
import { StorageKey } from '@/utils/cosnts';

export interface RestApiResult<T = string> {
  status: number;
  message: string;
  result: T;
}

export type RestPagerResult<T> = RestApiResult<Pager<T>>;

export type RestApiPromise<T = string> = Promise<RestApiResult<T>>;

export type RestPagerPromise<T> = Promise<RestPagerResult<T>>;

export interface Pager<T> {
  current: number;
  total: number;
  size: number;
  data: Array<T>;
}

export interface PagerSearchParams {
  pageIndex?: number;
  pageSize?: number;
  query?: string | null;
  sort?: string | null;
}

export interface RequestOptions extends RequestInit {
  method?: MethodEnum;
  // 成功时自动弹出提示
  successMessage?: boolean | string;
  // 500错误时自动弹出通知
  errorTitle?: boolean | string;
  // 其他非[200,300)状态码时自动弹出通知
  failedTitle?: boolean | string;
  resolveErrorResponse?: boolean;
  rawResponse?: boolean;
  prefix?: string;
  data?: { [key: string]: any } | BodyInit;
  headers?: { [name: string]: string };
}

export const STATUS_CODE_MAP: { [code: number]: string } = {
  400: '参数不正确',
  404: '请求的内容不存在',
  403: '您无权访问该内容',
  405: '请求方法不支持',
  499: '未知原因失败',
  500: '服务端异常',
};

export function showErrorNotification(title: string, url: string, msg: string) {
  notification.error({
    message: title,
    description: (
      <>
        <div className="word-break-all">{url}</div>
        <div className="word-break-all">{msg}</div>
      </>
    ),
    duration: 8,
  });
}

function makeErrorTitle(
  title: string | boolean,
  status: number,
  json: RestApiResult<string>,
  url: string,
) {
  let realTitle = '';
  if (typeof title === 'string') {
    realTitle = title;
  } else {
    realTitle = chainingCheck(STATUS_CODE_MAP, status) || json.message;
  }
  showErrorNotification(realTitle, url, json.result);
}

export const enum DeleteEnum {
  RECYCLE = 'recycle',
  DESTROY = 'destroy',
  RESTORE = 'restore',
}

export const enum MethodEnum {
  DELETE = 'DELETE',
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  PATCH = 'PATCH',
}

export default async function request<T>(
  api: string,
  options?: RequestOptions,
): Promise<RestApiResult<T>> {
  return new Promise((resolve, reject) => {
    const {
      errorTitle,
      successMessage,
      failedTitle,
      resolveErrorResponse,
      rawResponse,
      prefix,
      body,
      data,
      ...opt
    } = _.merge(
      {
        method: MethodEnum.GET,
        errorTitle: true,
        successMessage: false,
        failedTitle: false,
        resolveErrorResponse: false,
        rawResponse: false,
        prefix: '',
        credentials: 'include',
        headers: {
          Accept: 'application/json',
        },
      },
      options || {},
    ) as RequestOptions & { headers: { [name: string]: string } };

    const realOptions = _.merge(opt || {}, {
      body: _.isPlainObject(data) ? JSON.stringify(data) : data || body,
    });

    if (_.isPlainObject(data)) {
      realOptions.headers = _.merge(
        {
          'Content-Type': 'application/json',
        },
        realOptions.headers,
      );
    }

    const user = getSessionStorage<Account>(StorageKey.CURRENT_USER_SESSION);

    if (user?.token) {
      realOptions.headers.Authorization = user.token;
    }

    const url = prefix + api;

    fetch(url, realOptions)
      .then(res => {
        res.text().then(text => {
          try {
            // eslint-disable-next-line no-eval
            const json = eval(`(${text})`);
            if (res.status >= 500) {
              errorTitle &&
                makeErrorTitle(
                  errorTitle,
                  res.status,
                  json,
                  `${realOptions.method} ${res.url || url}`,
                );
              reject(json);
            } else if (res.status >= 400) {
              failedTitle &&
                makeErrorTitle(
                  failedTitle,
                  res.status,
                  json,
                  `${realOptions.method} ${res.url || url}`,
                );
              reject(json);
            } else if (res.status >= 200 && res.status < 300) {
              if (successMessage) {
                let msg = '';
                if (typeof successMessage === 'string') {
                  msg = successMessage;
                } else if (realOptions.method === MethodEnum.POST) {
                  msg = '提交成功';
                } else if (realOptions.method === MethodEnum.DELETE) {
                  msg = '删除成功';
                } else if (
                  realOptions.method === MethodEnum.PUT ||
                  realOptions.method === MethodEnum.PATCH
                ) {
                  msg = '修改成功';
                }
                message.success(msg, 5);
              }
              resolve(json);
            }
          } catch (e) {
            const obj: RestApiResult<string> = {
              status: -1,
              message: 'Parse Error',
              result: `后端返回结果无法解析为JSON：${e.message}`,
            };
            showErrorNotification(
              '数据解析失败',
              `${realOptions.method} ${res.url || url}`,
              obj.result,
            );
            reject(obj);
          }
        });
      })
      .catch(reason => {
        const obj: RestApiResult<string> = {
          status: -1,
          message: 'Fetch Error',
          result: `${reason}`,
        };
        reject(obj);
      });
  });
}
