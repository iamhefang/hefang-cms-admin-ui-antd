import React, { useEffect, useState } from 'react';
import { connect } from 'dva';
import classNames from 'classnames';
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  List,
  Modal,
  Pagination,
  Row,
  Skeleton,
  Tabs,
  Tag,
} from 'antd';
import { FormItemProps } from 'antd/lib/form';
import { useForm } from 'antd/lib/form/Form';
import { ConnectProps, ConnectState } from '@/models/connect';
import { LoginState } from '@/models/login';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import CommonForm from '@/components/CommonForm/CommonForm';
import { DislikeOutlined, EyeOutlined, LikeOutlined, UserOutlined } from '@ant-design/icons/lib';
import { ProfileState } from '@/models/profile';
import moment from 'moment';
import { execute } from 'hefang-js';

export type ProfileProps = {
  login: LoginState;
  profile: ProfileState;
} & ConnectProps;

function Profile(props: ProfileProps) {
  const [infoForm] = useForm();
  const [passwordForm] = useForm();
  const {
    profile: { articles },
  } = props;
  const [showModal, toggleModal] = useState(false);
  useEffect(() => {
    execute(props.dispatch, {
      type: 'profile/fetchMyArticle',
    });
  }, [articles?.total]);
  const formItems: FormItemProps[] = [
    // {
    //   label: "头像",
    //   name: "avatar",
    //   children: <Input/>
    // },
    {
      label: '用户名',
      name: 'name',
      required: true,
      children: <Input placeholder="请输入用户名" readOnly />,
    },
    {
      label: '邮箱',
      name: 'email',
      children: <Input type="email" placeholder="请输入邮箱" />,
    },
    {
      label: '注册时间',
      name: 'registerTime',
      children: <Input type="datetime" readOnly />,
    },
    {
      label: '注册方式',
      name: 'registerType',
      children: <Input readOnly />,
    },
  ];
  return (
    <PageHeaderWrapper title="个人中心">
      <Modal
        title={
          <>
            <UserOutlined /> 修改密码
          </>
        }
        width={400}
        visible={showModal}
        onOk={() => {
          passwordForm.validateFields();
        }}
        onCancel={() => toggleModal(false)}
      >
        <Form form={passwordForm} name="password-form" layout="vertical">
          <CommonForm
            items={[
              { label: '老密码', name: 'pwd', children: <Input.Password />, required: true },
              { label: '新密码', name: 'newPwd', children: <Input.Password />, required: true },
              {
                label: '重复新密码',
                name: 'reNewPwd',
                children: <Input.Password />,
                required: true,
              },
            ]}
          />
        </Form>
      </Modal>
      <Row gutter={20}>
        <Col flex="400px">
          <Card>
            <Form form={infoForm} name="profile-form" layout="vertical">
              <div className={classNames('align-center')}>
                <img
                  src={props.login.currentUser?.avatar}
                  alt="头像"
                  style={{ height: 150, width: 150, borderRadius: '50%', backgroundColor: 'gray' }}
                />
              </div>
              <CommonForm
                items={formItems}
                form={infoForm}
                initialValues={props.login.currentUser}
              />
              <Form.Item className="align-right">
                <Button type="dashed" onClick={() => toggleModal(true)}>
                  修改密码
                </Button>
                <Button htmlType="submit" type="primary" style={{ marginLeft: 15 }}>
                  更新
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
        <Col flex={1}>
          <Card>
            <Tabs>
              <Tabs.TabPane tab={`文章(${articles?.total || 0})`} key="articles">
                <Skeleton loading={!articles} active>
                  <List
                    dataSource={articles?.data}
                    renderItem={item => (
                      <List.Item
                        key={item.id}
                        actions={[
                          <>
                            <EyeOutlined /> {item.readCount}
                          </>,
                          <>
                            <LikeOutlined /> {item.opposeCount}
                          </>,
                          <>
                            <DislikeOutlined /> {item.approvalCount}
                          </>,
                          moment(item.postTime, 'YYYY-MM-DD HH:mm:ss').format('YYYY年MM月DD日'),
                        ]}
                      >
                        <List.Item.Meta
                          title={[
                            item.title,
                            item.isDraft ? (
                              <Tag color="processing" style={{ marginLeft: 10 }}>
                                草稿
                              </Tag>
                            ) : null,
                          ]}
                          description={item.description}
                        />
                        {item?.tags?.map(tag => <Tag>{tag}</Tag>) || '无标签'}
                      </List.Item>
                    )}
                    footer={
                      <Pagination
                        pageSize={articles?.size || 20}
                        total={articles?.total || 0}
                        current={articles?.current}
                      />
                    }
                  />
                </Skeleton>
              </Tabs.TabPane>
              <Tabs.TabPane tab="评论" key="comments" />
              <Tabs.TabPane tab="文件" key="files" />
            </Tabs>
          </Card>
        </Col>
      </Row>
    </PageHeaderWrapper>
  );
}

export default connect(({ login, profile }: ConnectState) => ({ login, profile }))(Profile);
