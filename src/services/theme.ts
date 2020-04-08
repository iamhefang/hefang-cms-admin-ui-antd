import request, { MethodEnum, RestApiPromise } from '@/utils/request';
import { Setting } from '@/services/setting';

export interface Theme {
  id: string;
  name: string;
  version: string;
  supportVersion: string | string[];
  author?: PluginAuthor;
  tags?: string[];
  locales?: string[];
  description?: string;
  publicFiles?: string[];
  settings?: PluginSetting[];
  isCurrent: boolean;
  homepage?: string;
  issues?: string;
}

export interface PluginAuthor {
  name: string;
  email: string;
  site: string;
}

export interface PluginSetting extends Omit<Setting, 'category'> {
  default: any;
}

export async function queryAllTheme(): RestApiPromise<Theme[]> {
  return request('/apis/admin/theme/list.json');
}

export async function deleteTheme(theme: Theme): RestApiPromise {
  return request(`/apis/admin/theme/delete/${theme.id}.json`, {
    method: MethodEnum.DELETE,
    failedTitle: '删除失败',
  });
}
