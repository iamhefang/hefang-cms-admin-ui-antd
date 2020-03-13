import request, { PagerSearchParams, RestPagerResult } from "@/utils/request";
import QueryString from "qs";
import { Article } from "@/models/articleList";

export async function queryArticles(params?: PagerSearchParams): Promise<RestPagerResult<Article>> {
  return request(`/apis/content/article/list.json?${QueryString.stringify(params)}`)
}

export async function deleteArticles(ids: string[]) {
  return request("/apis/content/article/delete.json", {
    method: "DELETE",
    data: { ids },
    successMessage: true,
    failedTitle: true,
    errorTitle: true
  })
}
