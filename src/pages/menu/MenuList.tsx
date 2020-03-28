import { PageHeaderWrapper } from '@ant-design/pro-layout';
import React, { ReactElement, useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { ConnectProps, ConnectState } from '@/models/connect';
import { deleteMenus, setMenu, SideMenu } from '@/services/menu';
import { Button, Form, Input, InputNumber, message, Modal, Popconfirm, Select, Switch } from 'antd';
import FontAwesomeIcon from '@/components/FontAwesomeIcon/FontAwesomeIcon';
import { EditOutlined, QuestionCircleOutlined } from '@ant-design/icons/lib';
import { FormInstance, useForm } from 'antd/lib/form/Form';
import { FormItemProps } from 'antd/lib/form';
import _ from 'lodash';
import { DeleteEnum } from '@/utils/request';
import { MenuState } from '@/models/menu';
import { execute } from 'hefang-js';
import { LoginState } from '@/models/login';
import EditableProTable, {
  EditableProTableColumn,
} from '@/components/EditableProTable/EditableProTable';
import { ActionType } from '@ant-design/pro-table';

const formItemLayout: Pick<FormItemProps, 'labelCol' | 'wrapperCol'> = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};

function showMenuEditor(form: FormInstance, currentMenus?: SideMenu[], menu?: SideMenu) {
  Modal.confirm({
    title: menu ? `编辑菜单: ${menu.name}` : '新建菜单',
    onOk: () => {
      form.validateFields();
      return false;
    },
    onCancel: () => {
      form.resetFields();
    },
    content: (
      <Form
        initialValues={menu || {}}
        form={form}
        layout="horizontal"
        style={{ marginTop: 30 }}
        name={menu?.id || 'new-menu-modal'}
      >
        <Form.Item label="名称" name="name" {...formItemLayout} required>
          <Input />
        </Form.Item>
        <Form.Item label="路径" name="path" {...formItemLayout} required>
          <Input />
        </Form.Item>
        <Form.Item label="图标" name="icon" {...formItemLayout}>
          <Input />
        </Form.Item>
        <Form.Item label="排序" name="sort" {...formItemLayout}>
          <InputNumber />
        </Form.Item>
        {Array.isArray(currentMenus) ? (
          <Form.Item label="上级菜单" name="parentId" {...formItemLayout}>
            <Select placeholder="无上级菜单">
              <Select.Option value="">无上级菜单</Select.Option>
              {currentMenus
                ?.filter(menuItem => !menuItem.parentId)
                ?.map(menuItem => (
                  <Select.Option value={menuItem.id}>{menuItem.name}</Select.Option>
                ))}
            </Select>
          </Form.Item>
        ) : null}
      </Form>
    ),
  });
}

function filterMenus(search: string, menus?: SideMenu[]) {
  if (!menus) return [];
  return menus
    ?.filter(
      menu =>
        menu.name.includes(search) || menu.children?.some(child => child.name.includes(search)),
    )
    ?.map(menu => {
      const newMenu = _.cloneDeep(menu);
      if (!menu.name.includes(search)) {
        newMenu.children = newMenu.children?.filter(child => child.name.includes(search));
      }
      return newMenu;
    });
}

export type MenuListProps = { menu: MenuState; login: LoginState } & ConnectProps;

function MenuList(props: MenuListProps) {
  const [form] = useForm();
  const [search, setSearch] = useState<string>('');
  const refAction = useRef<ActionType>();
  const reloadData = () => {
    execute(props.dispatch, {
      type: 'menu/fetchAllMenus',
    });
  };
  useEffect(reloadData, [props.menu?.menus?.length]);

  const columns: EditableProTableColumn<SideMenu>[] = [
    {
      title: '编号',
      width: 100,
      align: 'center',
      render: (text: any, record: SideMenu, index: number) => `${index + 1}`,
    },
    {
      title: '图标',
      width: 150,
      align: 'center',
      dataIndex: 'icon',
      editable: true,
      render: (text: any) => <FontAwesomeIcon icon={text} />,
    },
    {
      title: '菜单名',
      dataIndex: 'name',
      width: 200,
      editable: true,
      render: (name: any) => {
        name = name.replace(search, `<span style="color: red">${search}</span>`);
        return <span dangerouslySetInnerHTML={{ __html: name }} />;
      },
    },
    {
      title: '路径',
      dataIndex: 'path',
      editable: true,
    },
    {
      title: '排序',
      dataIndex: 'sort',
      width: 120,
      sorter: (a, b) => a.sort - b.sort,
      align: 'center',
      editable: true,
      editType: 'number',
    },
    {
      title: '启用',
      dataIndex: 'enable',
      width: 80,
      align: 'center',
      render: (value: any, record: SideMenu) => (
        <Popconfirm
          icon={<QuestionCircleOutlined />}
          title={`确定要${record.enable ? '禁用' : '启用'}该菜单吗?`}
          onConfirm={() => {
            deleteMenus(
              [record.id],
              record.enable ? DeleteEnum.RECYCLE : DeleteEnum.RESTORE,
            ).finally(reloadData);
          }}
        >
          <Switch checkedChildren="是" unCheckedChildren="否" checked={value} />
        </Popconfirm>
      ),
    },
    {
      title: '操作',
      width: 120,
      align: 'center',
      render: (text, record: SideMenu): ReactElement[] => [
        <Button
          type="link"
          icon={<EditOutlined />}
          onClick={() => showMenuEditor(form, props?.menu?.menus, record)}
        />,
      ],
    },
  ];
  const dataSource = filterMenus(search, props?.menu?.menus);
  return (
    <PageHeaderWrapper title="菜单管理">
      <EditableProTable<SideMenu>
        columns={columns}
        rowKey="id"
        loading={props.menu.loading}
        actionRef={refAction}
        options={{
          setting: false,
          fullScreen: false,
          density: true,
          reload: reloadData,
        }}
        onEditSubmit={(values, record: SideMenu) => {
          if (_.isEqual(record, { ...record, ...values })) {
            message.info('内容未更改', 2);
            return;
          }
          setMenu({ ...values, id: record.id }).then(reloadData);
        }}
        expandedRowKeys={
          dataSource?.length === props?.menu?.menus?.length
            ? undefined
            : dataSource?.map(item => item.id)
        }
        dataSource={dataSource}
        search={false}
        toolBarRender={() => [
          <Button
            type="primary"
            onClick={() => {
              showMenuEditor(form, props?.menu?.menus);
            }}
          >
            新建菜单
          </Button>,
          <Input.Search placeholder="搜索菜单" onSearch={value => setSearch(value)} allowClear />,
        ]}
        size="small"
        pagination={false}
      />
    </PageHeaderWrapper>
  );
}

export default connect(({ login, menu }: ConnectState) => ({
  login,
  menu,
}))(MenuList);
