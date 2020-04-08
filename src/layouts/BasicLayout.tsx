/**
 * Ant Design Pro v4 use `@ant-design/pro-layout` to handle Layout.
 * You can view component api by:
 * https://github.com/ant-design/ant-design-pro-layout
 */
import ProLayout, {
  BasicLayoutProps as ProLayoutProps,
  MenuDataItem,
  Settings,
} from '@ant-design/pro-layout';
import { formatMessage } from 'umi-plugin-react/locale';
import React, { useEffect } from 'react';
import { Link } from 'umi';
import { Dispatch } from 'redux';
import { connect } from 'dva';
import RightContent from '@/components/GlobalHeader/RightContent';
import { ConnectState } from '@/models/connect';
import { SideMenu } from '@/services/menu';
import FontAwesomeIcon from '@/components/FontAwesomeIcon/FontAwesomeIcon';
import HeFangCmsFooter from '@/components/HeFangCmsFooter/HeFangCmsFooter';
import { Account } from '@/models/login';
import ScreenLocker from '@/components/ScreenLocker/ScreenLocker';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/es/locale/zh_CN';
import logo from '../assets/logo.svg';

export interface BasicLayoutProps extends ProLayoutProps {
  breadcrumbNameMap: {
    [path: string]: MenuDataItem;
  };
  route: ProLayoutProps['route'] & {
    authority: string[];
  };
  settings: Settings;
  dispatch: Dispatch;
  currentMenus?: SideMenu[];
  user?: Account;
}

const footerRender: BasicLayoutProps['footerRender'] = () => <HeFangCmsFooter />;

function menuDataRender(currentMenus?: SideMenu[]): any[] {
  if (!Array.isArray(currentMenus)) return [];
  return currentMenus
    .sort((a, b) => a.sort - b.sort)
    .map(menu => ({
      ...menu,
      icon: <FontAwesomeIcon icon={menu.icon} />,
      children: menuDataRender(menu.children),
    }));
}

const BasicLayout: React.FC<BasicLayoutProps> = props => {
  const { dispatch, children, settings, currentMenus } = props;
  /**
   * constructor
   */

  useEffect(() => {
    if (dispatch) {
      dispatch({
        type: 'user/fetchCurrent',
      });
    }
  }, [props.user?.id]);

  const handleMenuCollapse = (payload: boolean): void => {
    if (dispatch) {
      dispatch({
        type: 'global/changeLayoutCollapsed',
        payload,
      });
    }
  }; // get children authority

  return (
    <ConfigProvider locale={zhCN}>
      <ProLayout
        logo={logo}
        formatMessage={formatMessage}
        menuHeaderRender={(logoDom, titleDom) => (
          <Link to="/">
            {logoDom}
            {titleDom}
          </Link>
        )}
        onCollapse={handleMenuCollapse}
        menuItemRender={(menuItemProps, defaultDom) => {
          if (menuItemProps.isUrl || menuItemProps.children || !menuItemProps.path) {
            return defaultDom;
          }
          return <Link to={menuItemProps.path}>{defaultDom}</Link>;
        }}
        breadcrumbRender={(routers = []) => [
          {
            path: '/',
            breadcrumbName: '首页',
          },
          ...routers,
        ]}
        itemRender={(route, params, routes, paths) => {
          const first = routes.indexOf(route) === 0;
          return first ? (
            <Link to={paths.join('/')}>{route.breadcrumbName}</Link>
          ) : (
            <span>{route.breadcrumbName}</span>
          );
        }}
        footerRender={footerRender}
        menuDataRender={() => menuDataRender(currentMenus)}
        rightContentRender={() => <RightContent />}
        {...props}
        {...settings}
      >
        <ScreenLocker show={props?.user?.isLockedScreen} />
        {children}
      </ProLayout>
    </ConfigProvider>
  );
};
export default connect(({ global, settings, login }: ConnectState) => ({
  collapsed: global.collapsed,
  settings,
  currentMenus: login.currentMenus,
  user: login.currentUser,
}))(BasicLayout);
