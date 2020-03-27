import React, { useState } from 'react';
import { Button, Form, Input, Modal, Popconfirm, Spin } from 'antd';
import { UnlockOutlined } from '@ant-design/icons/lib';
import { useForm } from 'antd/lib/form/Form';
import { Rule } from 'antd/lib/form';
import { connect } from 'dva';
import { ConnectProps } from '@/models/connect';
import { execute } from 'hefang-js';
import { accountLockScreen } from '@/services/login';
import { RestApiResult } from '@/utils/request';

export interface ScreenLockerProps extends ConnectProps {
  show?: boolean;
}

const rules: Rule[] = [
  { required: true, message: '请输入解锁密码' },
  { min: 6, message: '密码输入错误, 请重新输入' },
];

export default connect(() => ({}))(function ScreenLocker(props: ScreenLockerProps) {
  const [me] = useForm();
  const [error, setError] = useState<string>('');
  const [unlocking, setUnlocking] = useState<boolean>(false);

  const doUnlock = () => {
    me.validateFields()
      .then(({ password }) => {
        setUnlocking(true);
        accountLockScreen(false, password)
          .then(res => {
            execute(props.dispatch, {
              type: 'login/saveCurrentUser',
              payload: res.result,
            });
          })
          .catch((errorResult: RestApiResult<string>) => {
            setError(errorResult.result);
            if (errorResult.status === 401) {
              setTimeout(() => {
                execute(props.dispatch, {
                  type: 'login/saveCurrentUser',
                  payload: null,
                });
              }, 1500);
            }
          });
      })
      .catch(
        ({
          errorFields: [
            {
              errors: [errorMessage],
            },
          ],
        }) => {
          setError(errorMessage);
        },
      )
      .finally(() => setUnlocking(false));
  };

  return (
    <Modal
      zIndex={1314581059682}
      title={[
        <UnlockOutlined key="screen-locker-icon" style={{ marginRight: 10 }} />,
        '当前已锁屏',
      ]}
      visible={props.show}
      centered
      mask
      destroyOnClose
      maskClosable={false}
      closable={false}
      keyboard={false}
      maskStyle={{ backgroundColor: 'red' }}
      footer={
        <div className="align-center">
          <Spin spinning={unlocking}>
            <Button type="primary" onClick={doUnlock}>
              解锁
            </Button>
            <Popconfirm
              overlayStyle={{ zIndex: 1314581059682 + 1, width: 300 }}
              placement="bottom"
              okText="重新登录"
              cancelText="知道了"
              title="如果忘记锁屏密码, 使用登录密码也能解锁"
              onConfirm={() => execute(props.dispatch, { type: 'login/logout' })}
            >
              <Button type="dashed">忘记密码?</Button>
            </Popconfirm>
          </Spin>
        </div>
      }
    >
      <Form form={me} className="align-center">
        <Form.Item
          name="password"
          required
          rules={rules}
          validateStatus={error && 'error'}
          help={error}
        >
          <Input.Password
            size="large"
            allowClear
            onPressEnter={doUnlock}
            placeholder="请输入解锁密码, 按回车键或点击下方解锁按钮"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
});
