import { ModelType } from '@/models/global';
import { Effect } from 'dva';
import { queryArticles } from '@/services/article';
import { Reducer } from 'redux';
import { Pager, RestPagerResult } from '@/utils/request';
import { Article } from '@/models/article';
import { getSessionStorage } from 'useful-storage';
import { StorageKey } from '@/utils/cosnts';
import { Account } from '@/models/login';
import { Comment, queryUnreadComments } from '@/services/comment';

export interface DashbordState {
  articleDrafts?: Pager<Article>;
  unreadComments?: Pager<Comment>;
}

export interface DashbordReducers {
  saveDrafts: Reducer<DashbordState>;
  saveUnreadComments: Reducer<DashbordState>;
}

export interface DashbordEffects {
  fetchDrafts: Effect;
  fetchUnreadComments: Effect;
}

const DashbordModel: ModelType<DashbordState, DashbordReducers, DashbordEffects, 'dashbord'> = {
  namespace: 'dashbord',

  state: {
    articleDrafts: { current: 1, total: 0, size: 0, data: [] },
    unreadComments: { current: 1, total: 0, size: 0, data: [] },
  },

  effects: {
    *fetchDrafts(_, { call, put }) {
      const user: Account = getSessionStorage(StorageKey.CURRENT_USER_SESSION);
      const res: RestPagerResult<Article> = yield call(queryArticles, {
        pageSize: 9,
        query: 'isDraft=true',
        sort: '-postTime',
        author: user.id,
      });
      yield put({
        type: 'saveDrafts',
        payload: res.result,
      });
    },
    *fetchUnreadComments(_, { call, put }) {
      const res: RestPagerResult<Comment> = yield call(queryUnreadComments);
      yield put({
        type: 'saveUnreadComments',
        payload: res.result,
      });
    },
  },

  reducers: {
    saveDrafts(state, { payload }) {
      return { ...state, articleDrafts: payload };
    },
    saveUnreadComments(state, { payload }) {
      return { ...state, unreadComments: payload };
    },
  },
};

export default DashbordModel;
