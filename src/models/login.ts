import { Reducer } from 'redux';
import { Effect } from 'dva';
import { stringify } from 'querystring';
import { router } from 'umi';

import { accountLockScreen, accountLogin, accountLogout, queryCurrentUser } from '@/services/login';
import { getPageQuery } from '@/utils/utils';
import { RestApiResult } from '@/utils/request';
import { md5, sha1 } from 'hefang-js';
import { getSessionStorage, setSessionStorage } from 'useful-storage';
import { StorageKey } from '@/utils/cosnts';
import { ModelType } from '@/models/global';
import { queryCurrentMenus, SideMenu } from '@/services/menu';

export interface Account {
  id?: string;
  roleId?: string;
  name?: string;
  password?: string;
  registerTime?: string;
  registerType?: string;
  email?: string;
  locked?: boolean;
  lockedTime?: string;
  avatar?: string;
  enable?: boolean;
  token?: string;
  loginIp?: string;
  loginTime?: string;
  lastLoginIp?: string;
  lastLoginTime?: string;
  isAdmin?: boolean;
  isSuperAdmin?: boolean;
  isLockedScreen?: boolean;
}

export interface LoginState {
  currentUser?: Account;
  currentMenus?: SideMenu[];
}

export interface LoginEffects {
  login: Effect;
  logout: Effect;
  fetchCurrentUser: Effect;
  fetchCurrentMenus: Effect;
  lockScreen: Effect;
}

export interface LoginReducers {
  saveCurrentUser: Reducer<LoginState>;
  saveCurrentMenus: Reducer<LoginState>;
  cleanCurrentUser: Reducer<LoginState>;
}

const LoginModel: ModelType<LoginState, LoginReducers, LoginEffects, 'login'> = {
  namespace: 'login',

  state: {
    currentUser: getSessionStorage(StorageKey.CURRENT_USER_SESSION) as Account,
    currentMenus: getSessionStorage(StorageKey.CURRENT_MENUS_SESSION, []),
  },

  effects: {
    *lockScreen({ payload: { lock = true, password = '' } = {} }, { call, put }) {
      const response: RestApiResult<Account> = yield call(accountLockScreen, lock, password);
      yield put({
        type: 'saveCurrentUser',
        payload: response.result,
      });
    },
    *login({ payload }, { call, put }) {
      const password = sha1(payload.password) + md5(payload.password);
      const response: RestApiResult<Account> = yield call(accountLogin, { ...payload, password });
      yield put({
        type: 'saveCurrentUser',
        payload: response.result,
      });
      yield put({
        type: 'fetchCurrentMenus',
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
    *logout(_, { call, put }) {
      const res: RestApiResult = yield call(accountLogout);
      yield put({
        type: 'cleanCurrentUser',
      });
      if (res.status === 200) {
        const { redirect } = getPageQuery();
        if (window.location.pathname !== '/user/login.html' && !redirect) {
          router.replace({
            pathname: '/user/login',
            search: stringify({
              redirect: window.location.href,
            }),
          });
        }
      }
    },
    *fetchCurrentUser(_, { call, put }) {
      const response: RestApiResult<Account> = yield call(queryCurrentUser);
      yield put({
        type: 'saveCurrentUser',
        payload: response.result,
      });
      yield put({
        type: 'fetchCurrentMenus',
      });
    },
    *fetchCurrentMenus(_, { call, put }) {
      const response = yield call(queryCurrentMenus);
      yield put({
        type: 'saveCurrentMenus',
        payload: response.result,
      });
    },
  },

  reducers: {
    saveCurrentMenus(state, { payload }) {
      setSessionStorage(StorageKey.CURRENT_MENUS_SESSION, payload);
      return { ...state, currentMenus: payload };
    },
    saveCurrentUser(state, { payload }) {
      setSessionStorage(StorageKey.CURRENT_USER_SESSION, payload);
      return { ...state, currentUser: payload };
    },
    cleanCurrentUser(state) {
      sessionStorage.removeItem(StorageKey.CURRENT_USER_SESSION);
      sessionStorage.removeItem(StorageKey.CURRENT_MENUS_SESSION);
      return { ...state, currentUser: {}, currentMenus: [] };
    },
  },
};

export default LoginModel;
