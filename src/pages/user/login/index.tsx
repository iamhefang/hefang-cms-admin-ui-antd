import { Checkbox } from 'antd';
import React, { useState } from 'react';
import { AnyAction, Dispatch } from 'redux';
import { connect } from 'dva';
import { LoginState } from '@/models/login';
import { LoginParamsType } from '@/services/login';
import { ConnectState } from '@/models/connect';
import LoginFrom from './components/Login';

import styles from './style.less';

const { Tab, UserName, Password, Submit } = LoginFrom;

interface LoginProps {
  dispatch: Dispatch<AnyAction>;
  userLogin: LoginState;
  submitting?: boolean;
}

// const LoginMessage: React.FC<{
//   content: string;
// }> = ({ content }) => (
//   <Alert
//     style={{
//       marginBottom: 24,
//     }}
//     message={content}
//     type="error"
//     showIcon
//   />
// );

const Login: React.FC<LoginProps> = props => {
  const [autoLogin, setAutoLogin] = useState(true);
  const [type, setType] = useState<string>('account');

  const handleSubmit = (values: LoginParamsType) => {
    const { dispatch } = props;
    dispatch({
      type: 'login/login',
      payload: { ...values, type },
    });
  };
  return (
    <div className={styles.main}>
      <LoginFrom activeKey={type} onTabChange={setType} onSubmit={handleSubmit}>
        <Tab key="account" tab="账户密码登录">
          {/*{status === 'error' && loginType === 'account' && !submitting && (*/}
          {/*  <LoginMessage content="账户或密码错误"/>*/}
          {/*)}*/}

          <UserName
            name="name"
            placeholder="用户名"
            rules={[
              {
                required: true,
                message: '请输入用户名!',
              },
            ]}
          />
          <Password
            name="password"
            placeholder="密码"
            rules={[
              {
                required: true,
                message: '请输入密码！',
              },
            ]}
          />
        </Tab>
        <div>
          <Checkbox checked={autoLogin} onChange={e => setAutoLogin(e.target.checked)}>
            自动登录
          </Checkbox>
          <a style={{ float: 'right', }}>
            忘记密码
          </a>
        </div>
        <Submit>登录</Submit>
      </LoginFrom>
    </div>
  );
};

export default connect(({ login, loading }: ConnectState) => ({
  userLogin: login,
}))(Login);
