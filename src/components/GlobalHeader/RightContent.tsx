import { Form, Input, Modal, Tooltip } from 'antd';
import { LockOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import React from 'react';
import { connect } from 'dva';
import { ConnectProps, ConnectState } from '@/models/connect';
import classNames from 'classnames';
import { execute } from 'hefang-js';
import { FormInstance, useForm } from 'antd/lib/form/Form';
import { ModalFuncProps } from 'antd/lib/modal';
import { SCREEN_LOCKER_PWD_MIN_LEN } from '@/utils/cosnts';
import Avatar from './AvatarDropdown';
import HeaderSearch from '../HeaderSearch';
import styles from './index.less';

export type SiderTheme = 'light' | 'dark';

export interface GlobalHeaderRightProps extends ConnectProps {
  theme?: SiderTheme;
  layout: 'sidemenu' | 'topmenu';
  isLockedScreen: boolean;
}

function doLockScreen(props: React.PropsWithChildren<GlobalHeaderRightProps>, form: FormInstance) {
  let duration = 15;
  let timer: number | null = null;
  let modal:
    | {
        destroy: () => void;
        update: (newConfig: ModalFuncProps) => void;
      }
    | undefined;
  const onOk = () =>
    form.validateFields().then(({ password }) => {
      timer && window.clearInterval(timer);
      execute(props.dispatch, {
        type: 'login/lockScreen',
        payload: { password },
      });
    });
  const startInterval = () => {
    timer = window.setInterval(() => {
      duration -= 1;
      if (duration <= 0) {
        onOk();
        return;
      }
      modal?.update({
        okText: `锁屏(${duration})`,
      });
    }, 1000);
  };
  modal = Modal.confirm({
    title: '设置锁屏密码',
    okText: `锁屏(${duration})`,
    cancelText: '取消',
    maskClosable: false,
    onCancel: () => {
      timer && window.clearInterval(timer);
    },
    content: (
      <Form form={form} layout="vertical" initialValues={{ password: '' }}>
        <Form.Item
          label="更改锁屏密码"
          name="password"
          rules={[
            {
              validator: (rule, value: string) => {
                if (value?.length && value.length < SCREEN_LOCKER_PWD_MIN_LEN) {
                  timer && window.clearInterval(timer);
                  return Promise.reject(
                    new Error(`请输入${SCREEN_LOCKER_PWD_MIN_LEN}位以上解锁密码`),
                  );
                }
                return Promise.resolve();
              },
            },
          ]}
          extra="设置解锁密码后使用解锁密码和登录密码都可以解锁屏幕, 若不设置解锁密码, 只能使用登录密码解锁"
        >
          <Input.Password
            placeholder={`请输入${SCREEN_LOCKER_PWD_MIN_LEN}位以上解锁密码, 留空使用上次密码`}
            onFocus={() => {
              duration = 10;
              timer && window.clearInterval(timer);
              modal?.update({ okText: '锁屏' });
            }}
            onBlur={() => {
              startInterval();
            }}
          />
        </Form.Item>
      </Form>
    ),
    onOk,
  });
  startInterval();
}

const GlobalHeaderRight: React.FC<GlobalHeaderRightProps> = props => {
  const { theme, layout } = props;
  let className = styles.right;

  if (theme === 'dark' && layout === 'topmenu') {
    className = `${styles.right}  ${styles.dark}`;
  }
  const [form] = useForm();

  return (
    <div className={className}>
      <HeaderSearch
        className={classNames(styles.action, styles.search)}
        placeholder="站内搜索"
        options={[]}
      />
      <Tooltip title="使用文档">
        <a
          target="_blank"
          href="https://cms.hefang.org"
          rel="noopener noreferrer"
          className={styles.action}
        >
          <QuestionCircleOutlined />
        </a>
      </Tooltip>
      <Tooltip title="锁屏">
        <a className={styles.action} onClick={() => doLockScreen(props, form)}>
          <LockOutlined />
        </a>
      </Tooltip>
      <Avatar />
    </div>
  );
};

export default connect(({ settings, login }: ConnectState) => ({
  theme: settings.navTheme,
  layout: settings.layout,
  isLockedScreen: !!login?.currentUser?.isLockedScreen,
}))(GlobalHeaderRight);
