import request, { RestApiPromise } from '@/utils/request';

export async function cleanServerCache(): RestApiPromise {
  return request('/apis/admin/cache/clean.json');
}
