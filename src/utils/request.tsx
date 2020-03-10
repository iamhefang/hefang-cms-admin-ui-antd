import React from "react";
import _ from "lodash";
import { chainingCheck } from "hefang-js";
import { message, notification } from "antd";
import { getSessionStorage } from "useful-storage";
import { Account } from "@/models/login";

export interface RestApiResult<T> {
  status: number
  message: string
  result: T
}

export interface Pager<T> {
  index: number
  total: number
  size: number
  data: Array<T>
}

export type RestPagerResult<T> = RestApiResult<Pager<T>>

export interface RequestOptions extends RequestInit {
  // 成功时自动弹出提示
  successMessage?: boolean | string
  // 500错误时自动弹出通知
  errorTitle?: boolean | string
  // 其他非[200,300)状态码时自动弹出通知
  failedTitle?: boolean | string
  resolveErrorResponse?: boolean
  rawResponse?: boolean,
  prefix?: string
  data?: { [key: string]: any }
  headers?: { [name: string]: string }
}

export const STATUS_CODE_MAP: { [code: number]: string } = {
  400: "参数不正确",
  404: "请求的内容不存在",
  403: "您无权访问该内容",
  500: "服务端异常"
};

export function showErrorNotification(title: string, url: string, msg: string) {
  notification.error({
    message: title,
    description: <>
      <div className="word-break-all">{url}</div>
      <div className="word-break-all">{msg}</div>
    </>,
    duration: 5000
  });
}

function makeErrorTitle(title: string | boolean, status: number, json: RestApiResult<string>, url: string) {
  let realTitle = "";
  if (typeof title === "string") {
    realTitle = title;
  } else {
    realTitle = chainingCheck(STATUS_CODE_MAP, status) || json.message;
  }
  showErrorNotification(realTitle, url, json.result)
}

export default async function request<T>(api: string, options?: RequestOptions): Promise<RestApiResult<T>> {
  return new Promise((resolve, reject) => {
    const {
      errorTitle, successMessage, failedTitle,
      resolveErrorResponse,
      rawResponse,
      prefix,
      data, body,
      ...opt
    } = _.extend({
      method: "GET",
      errorTitle: true,
      successMessage: false,
      failedTitle: false,
      resolveErrorResponse: false,
      rawResponse: false,
      prefix: "",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      }
    }, options || {}) as RequestOptions & { headers: { [name: string]: string } };

    const realOptions = _.extend(opt || {}, {
      body: _.isObject(data) ? JSON.stringify(data) : body
    });

    const { token } = getSessionStorage<Pick<Account, "token">>("user", { token: "" });

    if (token) {
      realOptions.headers.Authorization = token;
    }
    const url = prefix + api;

    fetch(url, realOptions)
      .then(res => {
        res.text().then(text => {
          try {
            // eslint-disable-next-line no-eval
            const json = eval(`(${text})`);
            if (res.status >= 500) {
              errorTitle && makeErrorTitle(errorTitle, res.status, json, res.url || url);
              reject(json);
            } else if (res.status >= 400) {
              failedTitle && makeErrorTitle(failedTitle, res.status, json, res.url || url);
              reject(json);
            } else if (res.status >= 200 && res.status < 300) {
              if (successMessage) {
                let msg = "";
                if (typeof successMessage === "string") {
                  msg = successMessage;
                } else if (realOptions.method === "POST") {
                  msg = "提交成功";
                } else if (realOptions.method === "DELETE") {
                  msg = "删除成功";
                } else if (realOptions.method === "PUT" || realOptions.method === "PATCH") {
                  msg = "修改成功";
                }
                message.success(msg, 4000);
              }
              resolve(json)
            }
          } catch (e) {
            const obj: RestApiResult<string> = {
              status: -1,
              message: "Parse Error",
              result: `后端返回结果无法解析为JSON：${e.message}`
            };
            showErrorNotification("数据解析失败", res.url || url, obj.result);
            reject(obj);
          }
        });
      })
      .catch(reason => {
        const obj: RestApiResult<string> = {
          status: -1,
          message: "Fetch Error",
          result: `${reason}`
        };
        reject(obj)
      });
  });
}
