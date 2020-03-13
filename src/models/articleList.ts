import { ModelType } from "@/models/global";
import { Pager, RestPagerResult } from "@/utils/request";
import { Effect } from "dva";
import { queryCategories } from "@/services/category";
import { Reducer } from "redux";

export interface Article {
  id: string
  title: string
  path: string
  keywords: string
  description: string
  content: string
  postTime: string
  lastAlterTime: string
  authorId: string
  readCount: number
  approvalCount: number
  opposeCount: number
  isDraft: boolean
  categoryId: string
  categoryName: string
  enable: boolean
  isPrivate: boolean
  type: string
  extra: string
  tags: string[]
}

export interface Category {
  id: string
  name: string
  keywords: string
  description: string
  enable: boolean
  type: string
}

export interface ArticleListState extends Pager<Article> {
  categories: Category[]
}

export interface ArticleListReducers {
  saveCategories: Reducer<ArticleListState>
}

export interface ArticleListEffects {
  fetchCategories: Effect
}

const Model: ModelType<ArticleListState, ArticleListReducers, ArticleListEffects, 'articleList'> = {
  namespace: "articleList",

  state: {
    current: 1,
    total: 0,
    size: 10,
    data: [],
    categories: []
  },

  effects: {
    * fetchCategories({ payload }, { call, put }) {
      const response: RestPagerResult<Category> = yield call(queryCategories, payload);
      yield  put({
        type: "articleList/saveCategories",
        payload: response.result.data
      })
    },
  },
  reducers: {
    // @ts-ignore
    saveCategories(state, { payload }) {
      return { ...state, categories: payload }
    }
  },
};

export default Model;
