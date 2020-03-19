import { ModelType } from "@/models/global";
import { Pager, RestApiResult, RestPagerResult } from "@/utils/request";
import { Effect } from "dva";
import { queryCategories } from "@/services/category";
import { Reducer } from "redux";
import { queryArticle } from "@/services/article";
import { ContentTag, queryTags } from "@/services/tag";

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
  tags: ContentTag[]
  article: Article
}

export interface ArticleReducers {
  saveCategories?: Reducer<ArticleState>
  saveTags?: Reducer<ContentTag[]>
  saveArticle?: Reducer<Article>
}

export interface ArticleEffects {
  fetchCategoriesAndTags: Effect
  fetchArticle: Effect
}

const ArticleModel: ModelType<ArticleState, ArticleReducers, ArticleEffects, 'article'> = {
  namespace: "article",

  state: {
    current: 1,
    total: 0,
    size: 10,
    data: [],
    categories: [],
    tags: [],
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
    * fetchCategoriesAndTags({ payload }, { call, put }) {
      const categories: RestPagerResult<Category> = yield call(queryCategories, payload);
      const tags: RestPagerResult<ContentTag> = yield call(queryTags, { query: "type=article" });
      yield  put({
        type: "article/saveCategories",
        payload: categories.result.data
      });
      yield put({
        type: "article/saveTags",
        payload: tags.result.data
      })
    },
  },
  reducers: {
    // @ts-ignore
    saveCategories(state, { payload }) {
      return { ...state, categories: payload }
    },
    // @ts-ignore
    saveTags(state, { payload }) {
      return { ...state, tags: payload }
    },
    saveArticle(state, { payload }) {
      return { ...state, article: payload }
    }
  },
};

export default ArticleModel;
