import { PageHeaderWrapper } from "@ant-design/pro-layout";
import React, { useEffect } from "react";
import { Card, Col, Row } from "antd";
import { Link } from "umi";
import { connect } from "dva";
import { ConnectProps, ConnectState } from "@/models/connect";
import { DashbordState } from "@/models/dashbord";
import { execute } from "hefang-js";

function Dashbord({ articleDrafts, dispatch }: DashbordState & ConnectProps) {
  useEffect(() => {
    execute(dispatch, {
      type: "dashbord/fetchDrafts"
    })
  }, [articleDrafts?.total]);
  return <PageHeaderWrapper title="工作台">
    <Row gutter={20}>
      <Col span={16}>
        <Card title={`草稿(${articleDrafts?.total})`} extra={<Link to="/content/article/list.html">去文章列表页</Link>}>
          {articleDrafts?.data?.map(item => <Card.Grid>
            <h2>{item.title}</h2>
            <p>{item.description}</p>
          </Card.Grid>)}
        </Card>
      </Col>
      <Col span={8}>
        <Card title="功能导航">

        </Card>
      </Col>
    </Row>
  </PageHeaderWrapper>
}

export default connect(({ dashbord }: ConnectState) => dashbord)(Dashbord);
