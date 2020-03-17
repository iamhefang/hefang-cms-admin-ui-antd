import React from 'react';
import { connect } from 'dva';
import { PageLoading } from '@ant-design/pro-layout';
import { Redirect } from 'umi';
import { stringify } from 'querystring';
import { ConnectProps, ConnectState } from '@/models/connect';
import { Account } from "@/models/login";

interface SecurityLayoutProps extends ConnectProps {
  loading?: boolean;
  currentUser?: Account;
}

interface SecurityLayoutState {
  isReady: boolean;
}

class SecurityLayout extends React.Component<SecurityLayoutProps, SecurityLayoutState> {
  state: SecurityLayoutState = {
    isReady: false,
  };

  componentDidMount() {
    this.setState({
      isReady: true,
    });
    const { dispatch } = this.props;
    if (dispatch && !this.props.currentUser?.id) {
      dispatch({
        type: 'login/fetchCurrentUser',
      });
    }
  }

  render() {
    const { isReady } = this.state;
    const { children, loading, currentUser } = this.props;
    const isLogin = currentUser?.id;
    const queryString = stringify({
      redirect: window.location.href,
    });

    if ((!isLogin && loading) || !isReady) {
      return <PageLoading/>;
    }
    if (!isLogin && window.location.pathname !== '/user/login.html') {
      return <Redirect to={`/user/login.html?${queryString}`}/>;
    }
    return children;
  }
}

export default connect(({ login, loading }: ConnectState) => ({
  currentUser: login.currentUser,
  loading: loading.models.user,
}))(SecurityLayout);
