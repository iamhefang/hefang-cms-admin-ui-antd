import { connect } from 'dva';
import React, { useRef } from 'react';
import ProTable, { ActionType, ProColumns, RequestData } from '@ant-design/pro-table';
import { deleteTheme, queryAllTheme, Theme } from '@/services/theme';
import { Button, Divider, Popconfirm, Tag, Tooltip } from 'antd';
import {
  BugOutlined,
  DeleteOutlined,
  SettingFilled,
  SkinFilled,
  SkinOutlined,
} from '@ant-design/icons/lib';
import _ from 'lodash';
import { chainingCheck } from 'hefang-js';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { saveSettings } from '@/services/setting';

function doRequest(): Promise<RequestData<Theme>> {
  return new Promise((resolve, reject) => {
    queryAllTheme()
      .then(res => {
        resolve({
          success: true,
          total: res.result.length,
          data: res.result,
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

function ThemeList() {
  const actionRef = useRef<ActionType>();
  const columns: ProColumns<Theme>[] = [
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
            title="点击访问主题主页"
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
        <Tooltip title={record.issues ? '点击进入问题反馈页面' : '该主题未提供反馈页面'}>
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
      title: '操作',
      key: 'theme-list-action',
      align: 'center',
      width: 140,
      render: (text, record) => [
        record.isCurrent ? (
          <Tooltip title="该主题是当前主题">
            <Button
              key={makeKey(record, 'is-current')}
              type="link"
              size="small"
              icon={<SkinFilled />}
            />
          </Tooltip>
        ) : (
          <Tooltip title="使用该主题">
            <Popconfirm
              title={`要把《${record.name}》设置为当前主题吗？`}
              placement="leftTop"
              onConfirm={() => {
                saveSettings({
                  'site|theme': record.id,
                }).then(() => actionRef.current?.reload());
              }}
            >
              <Button
                key={makeKey(record, 'not-current')}
                type="link"
                size="small"
                icon={<SkinOutlined />}
              />
            </Popconfirm>
          </Tooltip>
        ),
        <Divider key={makeKey(record, 'divider-1')} type="vertical" />,
        _.isEmpty(record.settings) ? (
          <Tooltip title="该主题未提供配置项" placement="topRight">
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
        <Tooltip title="删除该主题" placement="topRight">
          <Popconfirm
            title="要删除该主题吗？"
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
      <ProTable<Theme>
        columns={columns}
        request={doRequest}
        pagination={false}
        actionRef={actionRef}
        search={false}
        toolBarRender={() => [
          <Button
            type="primary"
            href="https://cms.hefang.org/theme-store"
            target="_blank"
            key="link-2-theme-store"
          >
            主题商店
          </Button>,
        ]}
      />
    </PageHeaderWrapper>
  );
}

export default connect()(ThemeList);
