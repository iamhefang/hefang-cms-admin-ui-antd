import React from 'react';
import { Redirect } from 'umi';
import { connect } from 'dva';
import Authorized from '@/utils/Authorized';
import { getRouteAuthority } from '@/utils/utils';
import { ConnectProps, ConnectState } from '@/models/connect';
import { LoginState } from "@/models/login";

interface AuthComponentProps extends ConnectProps {
  login: LoginState;
}

const AuthComponent: React.FC<AuthComponentProps> = (
  {
    children,
    route = {
      routes: [],
    },
    location = {
      pathname: '',
    },
    login,
  }) => {
  const { currentUser } = login;
  const { routes = [] } = route;
  const isLogin = !!currentUser?.id;
  return (
    <Authorized
      authority={getRouteAuthority(location.pathname, routes) || ''}
      noMatch={isLogin ? <Redirect to="/exception/403.html"/> : <Redirect to="/user/login.html"/>}>
      {children}
    </Authorized>
  );
};

export default connect(({ login }: ConnectState) => ({
  login,
}))(AuthComponent);
