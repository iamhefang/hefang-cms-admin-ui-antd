import React, { RefObject } from 'react';
import { Button, Form, Input, Modal, Popconfirm, Spin } from 'antd';
import { UnlockOutlined } from '@ant-design/icons/lib';
import { FormInstance, Rule } from 'antd/lib/form';
import { connect } from 'dva';
import { ConnectProps } from '@/models/connect';
import { execute } from 'hefang-js';
import { accountLockScreen } from '@/services/login';
import { RestApiResult } from '@/utils/request';
import { SCREEN_LOCKER_PWD_MIN_LEN } from '@/utils/cosnts';
import lockerBg from '@/assets/locker-background.png';

export interface ScreenLockerProps extends ConnectProps {
  show?: boolean;
}

interface ScreenLockerState {
  unlocking: boolean;
  error: string;
}

const rules: Rule[] = [
  { required: true, message: '请输入解锁密码' },
  { min: SCREEN_LOCKER_PWD_MIN_LEN, message: '密码输入错误, 请重新输入' },
];

class ScreenLocker extends React.Component<ScreenLockerProps, ScreenLockerState> {
  private form: RefObject<FormInstance> = React.createRef();

  private timer = 0;

  constructor(props: ScreenLockerProps) {
    super(props);
    this.state = {
      unlocking: false,
      error: '',
    };
  }

  private onMouseMove = () => {
    this.timer && clearTimeout(this.timer);
    this.props.show && this.startInterval();
  };

  render() {
    const { show, dispatch } = this.props;
    const { unlocking, error } = this.state;
    return (
      <Modal
        zIndex={1314581059682}
        title={[
          <UnlockOutlined key="screen-locker-icon" style={{ marginRight: 10 }} />,
          '当前已锁屏',
        ]}
        visible={show}
        centered
        mask
        destroyOnClose
        maskClosable={false}
        closable={false}
        keyboard={false}
        maskStyle={{ background: `url(${lockerBg})` }}
        footer={
          <div className="align-center">
            <Spin spinning={unlocking}>
              <Button type="primary" onClick={this.doUnlock}>
                解锁
              </Button>
              <Popconfirm
                overlayStyle={{ zIndex: 1314581059682 + 1, width: 300 }}
                placement="bottom"
                okText="重新登录"
                cancelText="知道了"
                title="如果忘记锁屏密码, 使用登录密码也能解锁"
                onConfirm={() => execute(dispatch, { type: 'login/logout' })}
              >
                <Button type="link">忘记密码?</Button>
              </Popconfirm>
            </Spin>
          </div>
        }
      >
        <Form ref={this.form} className="align-center">
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
              onPressEnter={this.doUnlock}
              placeholder="请输入解锁密码, 按回车键或点击下方解锁按钮"
            />
          </Form.Item>
        </Form>
      </Modal>
    );
  }

  private startInterval = () => {
    this.timer = window.setTimeout(() => {
      execute(this.props.dispatch, { type: 'login/heartbeat' });
      this.startInterval();
    }, 5 * 60 * 1000);
  };

  componentDidMount(): void {
    window.addEventListener('mousemove', this.onMouseMove);
  }

  componentWillUnmount(): void {
    window.removeEventListener('mousemove', this.onMouseMove);
  }

  private doUnlock = () => {
    this.form.current
      ?.validateFields()
      .then(({ password }) => {
        this.setState({ unlocking: true });
        accountLockScreen(false, password)
          .then(res => {
            execute(this.props.dispatch, {
              type: 'login/saveCurrentUser',
              payload: res.result,
            });
          })
          .catch((errorResult: RestApiResult<string>) => {
            this.setState({ error: errorResult.result });
            if (errorResult.status === 401) {
              setTimeout(() => {
                execute(this.props.dispatch, {
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
          this.setState({ error: errorMessage });
        },
      )
      .finally(() => this.setState({ unlocking: false }));
  };
}

export default connect(() => ({}))(ScreenLocker);
