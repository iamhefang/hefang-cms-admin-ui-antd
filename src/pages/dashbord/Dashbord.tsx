import { PageHeaderWrapper } from '@ant-design/pro-layout';
import React, { useEffect } from 'react';
import { Button, Card, Col, Empty, Row } from 'antd';
import { Link } from 'umi';
import { connect } from 'dva';
import { ConnectProps, ConnectState } from '@/models/connect';
import { DashbordState } from '@/models/dashbord';
import { execute } from 'hefang-js';

const functionGuide = {
  新建文章: '/content/articles/editor.html',
  文章管理: '/content/articles/list.html',
  文件管理: '/content/files/list.html',
  评论管理: '/content/comments/list.html',
  个人中心: '/user/profile.html',
};

function Dashbord({ articleDrafts, dispatch }: DashbordState & ConnectProps) {
  useEffect(() => {
    execute(dispatch, {
      type: 'dashbord/fetchDrafts',
    });
  }, [articleDrafts?.total]);
  return (
    <PageHeaderWrapper title="工作台">
      <Row gutter={20}>
        <Col span={16}>
          <Card
            loading={!articleDrafts?.data?.length}
            title={`草稿(${articleDrafts?.total})`}
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
            title="未读评论"
            extra={<Link to="/content/comments/list.html">去评论列表页</Link>}
          >
            <Empty description="无未读评论" />
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
