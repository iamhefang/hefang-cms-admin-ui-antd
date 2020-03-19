import request, { PagerSearchParams, RestPagerPromise } from "@/utils/request";
import QueryString from "qs";

export interface ContentTag {
  contentId: string
  tag: string
  type: string
}

export async function queryTags(params?: PagerSearchParams): RestPagerPromise<ContentTag> {
  return request(`/apis/content/tag/list.json?${QueryString.stringify(params)}`)
}
