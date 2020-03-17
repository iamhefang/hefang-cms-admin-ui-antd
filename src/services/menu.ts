import request, { RestApiPromise } from "@/utils/request";

export interface SideMenu {
  id: string
  parentId: string
  name: string
  path: string
  icon: string
  sort: number
  enable: boolean
  children?: SideMenu[]
}

export async function queryAllMenus(): RestApiPromise<SideMenu> {
  return request("/apis/admin/menu/all.json")
}

export async function queryCurrentMenus(): RestApiPromise<SideMenu> {
  return request("/apis/user/account/menus.json")
}
