import { Reducer } from 'redux';
import { Effect } from 'dva';
import { stringify } from 'querystring';
import { router } from 'umi';

import { accountLogin, accountLogout, queryCurrentMenus, queryCurrentUser } from '@/services/login';
import { getPageQuery } from '@/utils/utils';
import { RestApiResult } from "@/utils/request";
import { md5, sha1 } from "hefang-js";
import { getSessionStorage, setSessionStorage } from "useful-storage";
import { StorageKey } from "@/utils/cosnts";
import { ModelType } from "@/models/global";

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

export interface LoginState {
  currentUser?: Account
  currentMenus?: any[]
}

export interface LoginEffects {
  login: Effect;
  logout: Effect;
  fetchCurrentUser: Effect
  fetchCurrentMenus: Effect
}

export interface LoginReducers {
  saveCurrentUser: Reducer<LoginState>
  saveCurrentMenus: Reducer<LoginState>
  cleanCurrentUser: Reducer<LoginState>
}

const Model: ModelType<LoginState, LoginReducers, LoginEffects, "login"> = {
  namespace: 'login',

  state: {
    currentUser: getSessionStorage(StorageKey.CURRENT_USER_SESSION, {}),
    currentMenus: []
  },

  effects: {
    * login({ payload }, { call, put }) {
      payload.password = sha1(payload.password) + md5(payload.password);
      const response: RestApiResult<Account> = yield call(accountLogin, payload);
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

    * logout(_, { call, put }) {
      const res: RestApiResult = yield call(accountLogout);
      yield put({
        type: "login/cleanCurrentUser"
      });
      if (res.status == 200) {
        const { redirect } = getPageQuery();
        if (window.location.pathname !== '/user/login' && !redirect) {
          router.replace({
            pathname: '/user/login',
            search: stringify({
              redirect: window.location.href,
            }),
          });
        }
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
    },
    cleanCurrentUser(state) {
      sessionStorage.removeItem(StorageKey.CURRENT_USER_SESSION);
      return { ...state, currentUser: {}, currentMenus: [] }
    }
  },
};

export default Model;