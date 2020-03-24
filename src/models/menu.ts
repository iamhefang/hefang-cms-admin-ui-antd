import { ModelType } from '@/models/global';
import { RestApiResult } from '@/utils/request';
import { Effect } from 'dva';
import { Reducer } from 'redux';
import { queryAllMenus, SideMenu } from '@/services/menu';

export interface MenuState {
  menus?: SideMenu[];
  loading?: boolean;
}

export interface MenuEffects {
  fetchAllMenus: Effect;
}

export interface MenuReducers {
  saveAllMenus: Reducer<MenuState>;
  setLoading: Reducer<MenuState>;
}

const MenuModel: ModelType<MenuState, MenuReducers, MenuEffects, 'menu'> = {
  namespace: 'menu',

  state: {
    loading: true,
  },

  effects: {
    *fetchAllMenus(_, { call, put }) {
      yield put({
        type: 'setLoading',
        payload: true,
      });
      const res: RestApiResult<SideMenu[]> = yield call(queryAllMenus);
      yield put({
        type: 'saveAllMenus',
        payload: res.result.sort((a, b) => a.sort - b.sort),
      });
      yield put({
        type: 'setLoading',
        payload: false,
      });
    },
  },

  reducers: {
    saveAllMenus(state, { payload }) {
      return { ...state, menus: payload };
    },
    setLoading(state, { payload }) {
      return { ...state, loading: payload };
    },
  },
};

export default MenuModel;
