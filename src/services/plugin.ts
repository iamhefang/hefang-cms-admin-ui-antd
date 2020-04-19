import request, { RestPagerPromise } from '@/utils/request';
import { PluginAuthor, PluginSetting } from '@/services/theme';

export interface Plugin {
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

export async function queryAllPlugins(): RestPagerPromise<Plugin> {
  return request('/apis/plugin/plugin/list.json');
}
