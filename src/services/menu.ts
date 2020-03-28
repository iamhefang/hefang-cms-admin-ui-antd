import request, { DeleteEnum, MethodEnum, RestApiPromise } from '@/utils/request';

export interface SideMenu {
  id: string;
  parentId: string;
  name: string;
  path: string;
  icon: string;
  sort: number;
  enable: boolean;
  children?: SideMenu[];
}

export async function queryAllMenus(): RestApiPromise<SideMenu[]> {
  return request('/apis/admin/menu/all.json');
}

export async function queryCurrentMenus(): RestApiPromise<SideMenu[]> {
  return request('/apis/user/account/menus.json');
}

export async function setMenu(menu: Partial<SideMenu>) {
  const { id, ...data } = menu;
  return request(`/apis/admin/menu/set${id ? `/${id}` : ''}.json`, {
    method: id ? MethodEnum.PATCH : MethodEnum.POST,
    data,
    successMessage: true,
  });
}

export async function deleteMenus(ids: string[], type: DeleteEnum = DeleteEnum.RECYCLE) {
  let successMessage: string | boolean = true;
  if (type === DeleteEnum.RESTORE) {
    successMessage = '启用成功';
  } else if (type === DeleteEnum.DESTROY) {
    successMessage = '删除成功';
  } else if (type === DeleteEnum.RECYCLE) {
    successMessage = '禁用成功';
  }
  return request(`/apis/admin/menu/delete/${type}.json`, {
    method: (type === DeleteEnum.RESTORE ? 'POST' : 'DELETE') as MethodEnum,
    data: { ids },
    successMessage,
    failedTitle: true,
    errorTitle: true,
  });
}
