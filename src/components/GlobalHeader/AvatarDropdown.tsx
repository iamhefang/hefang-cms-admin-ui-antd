import { DeleteOutlined, LogoutOutlined, SettingOutlined, UserOutlined } from '@ant-design/icons';
import { Alert, Avatar, Menu, Modal, Spin } from 'antd';
import { ClickParam } from 'antd/es/menu';
import React from 'react';
import { connect } from 'dva';
import { ConnectProps, ConnectState } from '@/models/connect';
import { Account } from '@/models/login';
import router from 'umi/router';
import { cleanServerCache } from '@/services/global';
import HeaderDropdown from '../HeaderDropdown';
import styles from './index.less';

export interface GlobalHeaderRightProps extends ConnectProps {
  currentUser?: Account;
  menu?: boolean;
}

class AvatarDropdown extends React.Component<GlobalHeaderRightProps> {
  onMenuClick = (event: ClickParam) => {
    const { key } = event;

    if (key === 'logout') {
      const { dispatch } = this.props;
      if (dispatch) {
        dispatch({
          type: 'login/logout',
        });
      }
    } else if (key === 'center') {
      router.push('/user/profile.html');
    } else if (key === 'clean-cache') {
      Modal.confirm({
        title: '确实要清空缓存吗？',
        content: (
          <div>
            {this.props.currentUser?.isSuperAdmin
              ? '将同步清空本地缓存和服务器端缓存，清空缓存可解决文章，主题或配置修改不生效问题，'
              : ''}
            清空缓存后本地设置和记住的账号密码信息将丢失，若有未保存的文章信息也将丢失。
            {this.props.currentUser?.isSuperAdmin ? (
              <Alert
                message="不建议频繁执行清空缓存操作，缓存可以提高页面响应速度，减轻服务器压力"
                type="warning"
              />
            ) : null}
          </div>
        ),
        okText: '清空缓存',
        onOk: () =>
          new Promise(resolve => {
            localStorage.clear();
            sessionStorage.clear();
            if (this.props.currentUser?.isSuperAdmin) {
              cleanServerCache().then(resolve);
            } else {
              resolve();
            }
          }),
      });
    }
  };

  render(): React.ReactNode {
    const {
      currentUser = {
        avatar: '',
        name: '',
        isSuperAdmin: false,
      },
    } = this.props;
    const menuHeaderDropdown = (
      <Menu className={styles.menu} selectedKeys={[]} onClick={this.onMenuClick}>
        <Menu.Item key="center">
          <UserOutlined />
          个人中心
        </Menu.Item>
        <Menu.Item key="settings">
          <SettingOutlined />
          个人设置
        </Menu.Item>
        {currentUser.isSuperAdmin ? (
          <Menu.Item key="clean-cache">
            <DeleteOutlined />
            清空缓存
          </Menu.Item>
        ) : (
          undefined
        )}
        <Menu.Divider />
        <Menu.Item key="logout">
          <LogoutOutlined />
          退出登录
        </Menu.Item>
      </Menu>
    );
    return currentUser && currentUser.name ? (
      <HeaderDropdown overlay={menuHeaderDropdown}>
        <span className={`${styles.action} ${styles.account}`}>
          <Avatar
            size="small"
            className={styles.avatar}
            src={currentUser.avatar}
            alt="avatar"
            icon={<UserOutlined />}
          />
          <span className={styles.name}>{currentUser.name}</span>
        </span>
      </HeaderDropdown>
    ) : (
      <Spin
        size="small"
        style={{
          marginLeft: 8,
          marginRight: 8,
        }}
      />
    );
  }
}

export default connect(({ login }: ConnectState) => ({
  currentUser: login.currentUser,
}))(AvatarDropdown);
