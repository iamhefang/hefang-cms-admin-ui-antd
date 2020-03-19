import { ModelType } from "@/models/global";
import { RestApiResult } from "@/utils/request";
import { Effect } from "dva";
import { Reducer } from "redux";
import { queryAllMenus, SideMenu } from "@/services/menu";

export interface MenuState {
  menus?: SideMenu[],
}

export interface MenuEffects {
  fetchAllMenus: Effect
}

export interface MenuReducers {
  saveAllMenus: Reducer<MenuState>
}

const MenuModel: ModelType<MenuState, MenuReducers, MenuEffects, "menu"> = {
  namespace: 'menu',

  state: {},

  effects: {
    * fetchAllMenus({ payload }, { call, put }) {
      const res: RestApiResult<SideMenu[]> = yield call(queryAllMenus);
      yield put({
        type: "menu/saveAllMenus",
        payload: res.result.sort((a, b) => a.sort - b.sort)
      })
    }
  },

  reducers: {
    saveAllMenus(state, { payload }) {
      return { ...state, menus: payload }
    }
  },
};

export default MenuModel;
