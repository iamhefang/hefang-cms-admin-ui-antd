import request, { DeleteEnum, MethodEnum, RestApiPromise } from "@/utils/request";

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

export async function setMenu(menu: Partial<SideMenu>) {
  return request(`/apis/admin/menu/set.json`, {
    method: menu.id ? MethodEnum.PATCH : MethodEnum.POST,
    data: menu,
    successMessage: true
  })
}

export async function deleteMenus(ids: string[], type: DeleteEnum = DeleteEnum.RECYCLE) {
  return request(`/apis/admin/menu/delete/${type}.json`, {
    method: (type === DeleteEnum.RESTORE ? "POST" : "DELETE") as MethodEnum,
    data: { ids },
    successMessage: true,
    failedTitle: true,
    errorTitle: true
  })
}
