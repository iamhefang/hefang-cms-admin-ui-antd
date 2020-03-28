import { PageHeaderWrapper } from '@ant-design/pro-layout';
import React, { useEffect } from 'react';
import { Button, Card, Col, Empty, Row, Table } from 'antd';
import { Link } from 'umi';
import { connect } from 'dva';
import { ConnectProps, ConnectState } from '@/models/connect';
import { DashbordState } from '@/models/dashbord';
import { execute } from 'hefang-js';
import { ColumnsType } from 'antd/lib/table';
import { Comment } from '@/services/comment';

const functionGuide = {
  新建文章: '/content/articles/editor.html',
  文章管理: '/content/articles/list.html',
  文件管理: '/content/files/list.html',
  评论管理: '/content/comments/list.html',
  个人中心: '/user/profile.html',
};
const commentColumns: ColumnsType<Comment> = [
  {
    title: '编号',
    align: 'center',
    width: 80,
    render: (_, record: Comment, index: number) => index + 1,
  },
  {
    title: '内容',
    dataIndex: 'content',
  },
  {
    title: '发表时间',
    dataIndex: 'postTime',
    align: 'center',
    width: 150,
    sorter: (a, b) => new Date(a.postTime).getTime() - new Date(b.postTime).getTime(),
  },
  {
    title: '已读时间',
    dataIndex: 'readTime',
    align: 'center',
    width: 150,
    sorter: (a, b) => {
      if (!a.readTime) return -1;
      if (!b.readTime) return 1;
      return new Date(a.readTime).getTime() - new Date(b.readTime).getTime();
    },
    render: text => text || '未读',
  },
  {
    title: '操作',
    width: 150,
    align: 'center',
    render: () => (
      <>
        <a>已读</a>
      </>
    ),
  },
];

function Dashbord({ articleDrafts, dispatch, unreadComments }: DashbordState & ConnectProps) {
  useEffect(() => {
    execute(dispatch, {
      type: 'dashbord/fetchDrafts',
    });
  }, [articleDrafts?.total]);
  useEffect(() => {
    execute(dispatch, {
      type: 'dashbord/fetchUnreadComments',
    });
  }, [unreadComments?.total]);
  return (
    <PageHeaderWrapper title="工作台">
      <Row gutter={20}>
        <Col span={16}>
          <Card
            loading={!articleDrafts?.data?.length}
            title={`我的草稿(${articleDrafts?.total})`}
            extra={<Link to="/content/articles/list.html">去文章列表页</Link>}
          >
            {articleDrafts?.data?.map(item => (
              <Card.Grid>
                <Link to={`/content/articles/editor/${item.id}.html`}>
                  <Card.Meta title={item.title} description={item.description} />
                </Link>
              </Card.Grid>
            )) || <Empty description="无草稿" />}
          </Card>
          <Card
            style={{ marginTop: 20 }}
            title={`未读评论(${unreadComments?.total})`}
            extra={<Link to="/content/comments/list.html">去评论列表页</Link>}
          >
            <Table columns={commentColumns} emptyText="无未读评论" pagination={false} />
          </Card>
        </Col>
        <Col span={8}>
          <Card title={`功能导航(${Object.keys(functionGuide).length})`}>
            {Object.keys(functionGuide).map(name => (
              <Link to={functionGuide[name]} key={functionGuide[name]}>
                <Button type="link">{name}</Button>
              </Link>
            ))}
          </Card>
          <Card style={{ marginTop: 20 }} title="动态">
            <Empty description="暂无动态" />
          </Card>
        </Col>
      </Row>
    </PageHeaderWrapper>
  );
}

export default connect(({ dashbord }: ConnectState) => dashbord)(Dashbord);
