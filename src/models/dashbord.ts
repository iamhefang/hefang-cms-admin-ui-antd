import { ModelType } from "@/models/global";
import { Effect } from "dva";
import { queryArticles } from "@/services/article";
import { Reducer } from "redux";
import { Pager, RestPagerResult } from "@/utils/request";
import { Article } from "@/models/articleList";


export interface DashbordState {
  articleDrafts: Pager<Article>
}

export interface DashbordReducers {
  saveDrafts: Reducer<DashbordState>
}

export interface DashbordEffects {
  fetchDrafts: Effect
}

const Model: ModelType<DashbordState, DashbordReducers, DashbordEffects, "dashbord"> = {
  namespace: "dashbord",

  state: {
    articleDrafts: { current: 1, total: 0, size: 0, data: [] }
  },

  effects: {
    * fetchDrafts({}, { call, put }) {
      const res: RestPagerResult<Article> = yield call(queryArticles, {
        pageSize: 9,
        query: "isDraft=true",
        sortKey: "postTime",
        sortType: "desc"
      });
      yield put({
        type: "dashbord/saveDrafts",
        payload: res.result
      })
    },
  },

  reducers: {
    saveDrafts(state, { payload }) {
      return { ...state, articleDrafts: payload }
    },
  },
};

export default Model;
