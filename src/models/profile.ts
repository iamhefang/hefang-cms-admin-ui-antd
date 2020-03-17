import { ModelType } from "@/models/global";
import { Article } from "@/models/article";
import { Pager, RestPagerResult } from "@/utils/request";
import { queryArticles } from "@/services/article";
import { getSessionStorage } from "useful-storage";
import { StorageKey } from "@/utils/cosnts";
import { Effect } from "dva";
import { Reducer } from "redux";
import { Account } from "@/models/login";

export interface ProfileState {
  articles?: Pager<Article>,
  comments?: []
}

export interface ProfileEffects {
  fetchMyArticle: Effect
}

export interface ProfileReducers {
  saveArticles: Reducer<ProfileState>
}

const ProfileModel: ModelType<ProfileState, ProfileReducers, ProfileEffects, "profile"> = {
  namespace: 'profile',

  state: {
    articles: {
      current: 1,
      total: 0,
      size: 20,
      data: []
    },
    comments: []
  },

  effects: {
    * fetchMyArticle({ payload }, { call, put }) {
      const user: Account = getSessionStorage(StorageKey.CURRENT_USER_SESSION, {});
      const res: RestPagerResult<Article> = yield call(queryArticles, { query: `authorId=${user.id}` });
      yield put({
        type: "profile/saveArticles",
        payload: res.result
      })
    }
  },

  reducers: {
    saveArticles(state, { payload }) {
      return { ...state, articles: payload }
    }
  },
};

export default ProfileModel;
