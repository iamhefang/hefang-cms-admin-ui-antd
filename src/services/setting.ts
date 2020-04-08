import request, { MethodEnum, RestApiPromise, RestPagerPromise } from '@/utils/request';

export type SettingType =
  | string
  | 'text'
  | 'int'
  | 'float'
  | 'switch'
  | 'select'
  | 'textarea'
  | 'password'
  | 'checkbox'
  | 'richText'
  | 'html';

export interface SettingCategory {
  id: string;
  name: string;
  description: string;
  settings: Setting[];
}

export interface Setting {
  category: string;
  key: string;
  name: string;
  value: string;
  type: SettingType;
  description: string;
  attribute: string;
  nullable: boolean;
  enable: boolean;
  sort: number;
  showInCenter: boolean;
}

export async function queryAllSettingCategories(): RestPagerPromise<SettingCategory> {
  return request('/apis/admin/settingcategory/list.json');
}

export async function saveSettings(data: { [key: string]: any }): RestApiPromise {
  return request('/apis/admin/setting/set.json', {
    method: MethodEnum.POST,
    data,
    successMessage: true,
  });
}
