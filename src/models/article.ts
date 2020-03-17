import { ModelType } from "@/models/global";
import { Pager, RestApiResult, RestPagerResult } from "@/utils/request";
import { Effect } from "dva";
import { queryCategories } from "@/services/category";
import { Reducer } from "redux";
import { queryArticle } from "@/services/article";

export interface Article {
  id?: string
  title?: string
  path?: string
  keywords?: string
  description?: string
  content?: string
  postTime?: string
  lastAlterTime?: string
  authorId?: string
  readCount?: number
  approvalCount?: number
  opposeCount?: number
  isDraft?: boolean
  categoryId?: string
  categoryName?: string
  enable?: boolean
  isPrivate?: boolean
  type?: string
  extra?: string
  tags?: string[]
}

export interface Category {
  id: string
  name: string
  keywords: string
  description: string
  enable: boolean
  type: string
}

export interface ArticleState extends Pager<Article> {
  categories: Category[]
  article: Article
}

export interface ArticleListReducers {
  saveCategories: Reducer<ArticleState>
  saveArticle: Reducer<Article>
}

export interface ArticleListEffects {
  fetchCategories: Effect
  fetchArticle: Effect
}

const ArticleModel: ModelType<ArticleState, ArticleListReducers, ArticleListEffects, 'article'> = {
  namespace: "article",

  state: {
    current: 1,
    total: 0,
    size: 10,
    data: [],
    categories: [],
    article: {}
  },

  effects: {
    * fetchArticle({ payload }, { call, put }) {
      const response: RestApiResult<Article> = yield call(queryArticle, payload);
      yield put({
        type: "article/saveArticle",
        payload: response.result
      })
    },
    * fetchCategories({ payload }, { call, put }) {
      const response: RestPagerResult<Category> = yield call(queryCategories, payload);
      yield  put({
        type: "article/saveCategories",
        payload: response.result.data
      })
    },
  },
  reducers: {
    // @ts-ignore
    saveCategories(state, { payload }) {
      return { ...state, categories: payload }
    },
    saveArticle(state, { payload }) {
      return { ...state, article: payload }
    }
  },
};

export default ArticleModel;
