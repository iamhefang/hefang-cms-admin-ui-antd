import request, { PagerSearchParams } from "@/utils/request";
import QueryString from "qs";

export async function queryCategories(params?: PagerSearchParams) {
  return request(`/apis/content/category/list.json?${QueryString.stringify(params)}`)
}
