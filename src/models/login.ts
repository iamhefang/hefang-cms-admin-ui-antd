import { Reducer } from 'redux';
import { Effect } from 'dva';
import { stringify } from 'querystring';
import { router } from 'umi';

import { fakeAccountLogin, queryCurrentMenus, queryCurrentUser } from '@/services/login';
import { getPageQuery } from '@/utils/utils';
import { RestApiResult } from "@/utils/request";
import { md5, sha1 } from "hefang-js";
import { getSessionStorage, setSessionStorage } from "useful-storage";
import { StorageKey } from "@/utils/cosnts";

export interface Account {
  id?: string
  roleId?: string
  name?: string
  password?: string
  registerTime?: string
  registerType?: string
  email?: string
  locked?: boolean
  lockedTime?: string
  avatar?: string
  enable?: boolean
  token?: string
  loginIp?: string
  loginTime?: string
  lastLoginIp?: string
  lastLoginTime?: string
}

export interface StateType {
  currentUser?: Account
  currentMenus?: any[]
}


export interface LoginModelType {
  namespace: string;
  state: StateType;
  effects: {
    login: Effect;
    logout: Effect;
    fetchCurrentUser: Effect
    fetchCurrentMenus: Effect
  };
  reducers: {
    saveCurrentUser: Reducer<StateType>
    saveCurrentMenus: Reducer<StateType>
  };
}

const Model: LoginModelType = {
  namespace: 'login',

  state: {
    currentUser: getSessionStorage(StorageKey.CURRENT_USER_SESSION, {}),
    currentMenus: []
  },

  effects: {
    * login({ payload }, { call, put }) {
      payload.password = sha1(payload.password) + md5(payload.password);
      const response: RestApiResult<Account> = yield call(fakeAccountLogin, payload);
      yield put({
        type: 'saveCurrentUser',
        payload: response.result,
      });
      // Login successfully
      if (response.status === 200) {
        const urlParams = new URL(window.location.href);
        const params = getPageQuery();
        let { redirect } = params as { redirect: string };
        if (redirect) {
          const redirectUrlParams = new URL(redirect);
          if (redirectUrlParams.origin === urlParams.origin) {
            redirect = redirect.substr(urlParams.origin.length);
            if (redirect.match(/^\/.*#/)) {
              redirect = redirect.substr(redirect.indexOf('#') + 1);
            }
          } else {
            window.location.href = '/';
            return;
          }
        }
        router.replace(redirect || '/');
      }
    },

    logout() {
      const { redirect } = getPageQuery();
      // Note: There may be security issues, please note
      if (window.location.pathname !== '/user/login' && !redirect) {
        router.replace({
          pathname: '/user/login',
          search: stringify({
            redirect: window.location.href,
          }),
        });
      }
    },
    * fetchCurrentUser(_, { call, put }) {
      const response = yield call(queryCurrentUser);
      yield put({
        type: 'saveCurrentUser',
        payload: response,
      });
    },
    * fetchCurrentMenus(_, { call, put }) {
      const response = yield call(queryCurrentMenus);
      yield put({
        type: "saveCurrentMenus",
        payload: response.result
      })
    }
  },

  reducers: {
    saveCurrentMenus(state, { payload }) {
      return { ...state, currentMenus: payload }
    },
    saveCurrentUser(state, { payload }) {
      setSessionStorage(StorageKey.CURRENT_USER_SESSION, payload);
      return { ...state, currentUser: payload }
    }
  },
};

export default Model;
