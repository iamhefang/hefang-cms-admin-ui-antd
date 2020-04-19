import { connect } from 'dva';
import React, { useRef, useState } from 'react';
import ProTable, { ActionType, ProColumns, RequestData } from '@ant-design/pro-table';
import { deleteTheme, Theme } from '@/services/theme';
import {
  Button,
  Divider,
  Dropdown,
  Menu,
  message,
  Modal,
  Popconfirm,
  Spin,
  Switch,
  Tag,
  Tooltip,
  Upload,
} from 'antd';
import {
  BugOutlined,
  DeleteOutlined,
  DownOutlined,
  InboxOutlined,
  SettingFilled,
} from '@ant-design/icons/lib';
import _ from 'lodash';
import { chainingCheck } from 'hefang-js';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { Plugin, queryAllPlugins } from '@/services/plugin';
import { UploadChangeParam } from 'antd/lib/upload';

// import "antd/lib/upload/style/index.less";

function doRequest(): Promise<RequestData<Theme>> {
  return new Promise((resolve, reject) => {
    queryAllPlugins()
      .then(res => {
        resolve({
          success: true,
          total: res.result.total,
          data: res.result.data,
        });
      })
      .catch(reject);
  });
}

function makeKey(theme: Theme, ...name: string[]) {
  return `theme-list-${theme.id}-${name.join('-')}`;
}

const versionMap = {
  '*': '所有版本',
};

function PluginList() {
  const actionRef = useRef<ActionType>();
  const [showUploadModal, setModalVisible] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [plugin, setPlugin] = useState<Plugin | null>(null);
  const columns: ProColumns<Plugin>[] = [
    {
      title: '编号',
      key: 'number',
      width: 60,
      align: 'center',
      renderText: (text, record, index) => index + 1,
    },
    {
      title: '名称',
      dataIndex: 'name',
      render: (text, record) =>
        record.homepage ? (
          <a
            href={record.homepage}
            style={{ paddingLeft: 0 }}
            target="_blank"
            rel="noreferrer noopener"
            title="点击访问插件主页"
          >
            {record.name}
          </a>
        ) : (
          record.name
        ),
    },
    {
      title: '版本',
      dataIndex: 'version',
    },
    {
      title: '标签',
      dataIndex: 'tags',
      render: (text, record) =>
        record?.tags?.map(tag => <Tag key={makeKey(record, 'tag', tag)}>{tag}</Tag>) || '无标签',
    },
    {
      title: '支持版本',
      dataIndex: 'supportVersion',
      render: (text, record) =>
        (Array.isArray(record.supportVersion)
          ? record.supportVersion
          : [record.supportVersion]
        ).map(v => (
          <Tag key={makeKey(record, 'support-version', v)}>{chainingCheck(versionMap, v) || v}</Tag>
        )),
    },
    {
      title: '反馈',
      dataIndex: 'issues',
      render: (text, record) => (
        <Tooltip title={record.issues ? '点击进入问题反馈页面' : '该插件未提供反馈页面'}>
          <Button
            type="link"
            href={record.issues}
            disabled={!record.issues}
            icon={<BugOutlined />}
          />
        </Tooltip>
      ),
    },
    {
      title: '作者',
      key: 'author',
      render: (text, record) => (
        <>
          <div>称呼：{record?.author?.name}</div>
          <div>
            邮箱：
            {record?.author?.email && (
              <a style={{ paddingLeft: 0 }} href={`mailto:${record.author.email}`}>
                {record.author.email}
              </a>
            )}
          </div>
          <div>
            网站：
            {record?.author?.site && (
              <a
                style={{ paddingLeft: 0 }}
                href={record.author.site}
                target="_blank"
                rel="noreferrer noopener"
              >
                {record.author.site}
              </a>
            )}
          </div>
        </>
      ),
    },
    {
      title: '启用',
      key: 'theme-list-enable',
      dataIndex: 'enable',
      align: 'center',
      width: 100,
      render: (enable, record) => (
        <Popconfirm
          title={`确定要${enable ? '关闭' : '打开'}插件《${record.name}》吗？`}
          okText={enable ? '关闭插件' : '打开插件'}
        >
          <Switch checkedChildren="开" unCheckedChildren="关" checked={enable as boolean} />
        </Popconfirm>
      ),
      filters: [
        { text: '已开启', value: true },
        { text: '已关闭', value: false },
      ],
    },
    {
      title: '操作',
      key: 'theme-list-action',
      align: 'center',
      width: 140,
      render: (text, record) => [
        _.isEmpty(record.settings) ? (
          <Tooltip title="该插件未提供配置项" placement="topRight">
            <Button
              key={makeKey(record, 'no-setting-button')}
              disabled
              type="link"
              size="small"
              icon={<SettingFilled />}
            />
          </Tooltip>
        ) : (
          <Button
            key={makeKey(record, 'setting-button')}
            type="link"
            size="small"
            icon={<SettingFilled />}
          />
        ),
        <Divider key={makeKey(record, 'divider-2')} type="vertical" />,
        <Tooltip title="卸载该插件" placement="topRight">
          <Popconfirm
            title="要卸载该插件吗？"
            placement="leftTop"
            onConfirm={() => {
              deleteTheme(record).then(() => actionRef.current?.reload());
            }}
          >
            <Button
              key={makeKey(record, 'delete')}
              type="link"
              danger
              size="small"
              icon={<DeleteOutlined />}
            />
          </Popconfirm>
        </Tooltip>,
      ],
    },
  ];

  return (
    <PageHeaderWrapper>
      <ProTable<Plugin>
        columns={columns}
        request={doRequest}
        pagination={false}
        actionRef={actionRef}
        search={false}
        toolBarRender={() => [
          <Dropdown
            key="install-new-plugin"
            overlay={
              <Menu>
                <Menu.Item onClick={() => setModalVisible(true)}>安装插件包</Menu.Item>
                <Menu.Divider />
                <Menu.Item
                  onClick={() => window.open('https://cms.hefang.org/plugin-store', '_blank')}
                >
                  插件商店
                </Menu.Item>
              </Menu>
            }
          >
            <Button target="_blank">
              安装插件 <DownOutlined />
            </Button>
          </Dropdown>,
        ]}
      />
      <Modal
        visible={showUploadModal}
        title="上传插件包"
        centered
        maskClosable={false}
        okButtonProps={{ loading: uploading }}
        onCancel={() => uploading || setModalVisible(false)}
      >
        {plugin ? (
          <div>
            <div>插件ID：{plugin.id}</div>
            <div>
              插件名称：{plugin.name}-v{plugin.version}
            </div>
            <div>描述：{plugin.description}</div>
          </div>
        ) : (
          <Spin spinning={uploading} tip="正在上传...">
            <Upload.Dragger
              action="/apis/plugin/plugin/upload/archive.php"
              beforeUpload={() => {
                setUploading(true);
                return true;
              }}
              onChange={({ file }: UploadChangeParam) => {
                if (file.status === 'done' && file.response) {
                  setPlugin(file.response.result);
                  setUploading(false);
                } else if (file.status === 'error') {
                  setUploading(false);
                  message.error(file.response.result, 10);
                }
              }}
              showUploadList={false}
              accept=".zip,.hpa,.phar"
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">点击此处或拖动插件包文件到此处上传插件</p>
              <p className="ant-upload-hint">插件包支持.phar,.zip和.hpa后缀的文件</p>
            </Upload.Dragger>
          </Spin>
        )}
      </Modal>
    </PageHeaderWrapper>
  );
}

export default connect()(PluginList);
