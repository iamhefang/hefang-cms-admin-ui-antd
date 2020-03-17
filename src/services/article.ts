import request, {
  DeleteEnum,
  MethodEnum,
  PagerSearchParams,
  RestApiPromise,
  RestApiResult,
  RestPagerResult
} from "@/utils/request";
import QueryString from "qs";
import { Article } from "@/models/article";


export async function queryArticles(params?: PagerSearchParams): Promise<RestPagerResult<Article>> {
  return request(`/apis/content/article/list.json?${QueryString.stringify(params)}`)
}

export async function queryArticle(idOrPath: string): Promise<RestApiResult<Article>> {
  return request(`/apis/content/article/get/${encodeURIComponent(idOrPath)}`)
}

export async function setArticle(article: Article, method: MethodEnum): RestApiPromise<string> {
  return request("/apis/content/article/set.json", {
    method,
    data: article,
    successMessage: true
  });
}

export async function deleteArticles(ids: string[], type: DeleteEnum = DeleteEnum.RECYCLE) {
  return request(`/apis/content/article/delete/${type}.json`, {
    method: (type === DeleteEnum.RESTORE ? "POST" : "DELETE") as MethodEnum,
    data: { ids },
    successMessage: true,
    failedTitle: true,
    errorTitle: true
  })
}
