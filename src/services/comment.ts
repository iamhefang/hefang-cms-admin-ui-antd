import request, { RestPagerPromise } from '@/utils/request';

export interface Comment {
  id: string;
  contentId: string;
  replayId: string;
  content: string;
  floor: number;
  postTime: string;
  readTime: string;
}

export async function queryUnreadComments(): RestPagerPromise<Comment> {
  return request('/apis/content/comment/list/unread.json');
}
