import { PageHeaderWrapper } from "@ant-design/pro-layout";
import React, { useState } from "react";
import { connect } from "react-redux";
import { ConnectState } from "@/models/connect";
import { SideMenu } from "@/services/menu";
import { Button, Form, Input, InputNumber, Modal, Select } from "antd";
import { ColumnsType } from "antd/lib/table";
import { LoginState } from "@/models/login";
import FontAwesomeIcon from "@/components/FontAwesomeIcon/FontAwesomeIcon";
import { EditOutlined } from "@ant-design/icons/lib";
import { FormInstance, useForm } from "antd/lib/form/Form";
import { FormItemProps } from "antd/lib/form";
import ProTable from "@ant-design/pro-table";
import _ from "lodash";

const formItemLayout: Pick<FormItemProps, "labelCol" | "wrapperCol"> = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 }
};

function showMenuEditor(form: FormInstance, currentMenus?: SideMenu[], menu?: SideMenu) {
  Modal.confirm({
    title: menu ? `编辑菜单: ${menu.name}` : "新建菜单",
    onOk: () => {
      form.validateFields();
      return false;
    },
    onCancel: () => {
      form.resetFields();
    },
    content: <Form initialValues={menu || {}}
                   form={form} layout={"horizontal"}
                   style={{ marginTop: 30 }}
                   name={menu?.id || "new-menu-modal"}>
      <Form.Item label="名称" name="name" {...formItemLayout} required>
        <Input/>
      </Form.Item>
      <Form.Item label="路径" name="path" {...formItemLayout} required>
        <Input/>
      </Form.Item>
      <Form.Item label="图标" name="icon" {...formItemLayout}>
        <Input/>
      </Form.Item>
      <Form.Item label="排序" name="sort" {...formItemLayout}>
        <InputNumber/>
      </Form.Item>
      {Array.isArray(currentMenus) ? <Form.Item label="上级菜单" name="parentId" {...formItemLayout}>
        <Select placeholder="无上级菜单">
          <Select.Option value="">
            无上级菜单
          </Select.Option>
          {currentMenus?.filter(menu => !menu.parentId)?.map(menu => (
            <Select.Option value={menu.id}>
              {menu.name}
            </Select.Option>
          ))}
        </Select>
      </Form.Item> : null}
    </Form>
  })
}

function filterMenus(search: string, menus?: SideMenu[]) {
  if (!menus) return [];
  return menus?.filter(menu => {
    return menu.name.includes(search) || menu.children?.some(child => child.name.includes(search))
  })?.map(menu => {
    const newMenu = _.cloneDeep(menu);
    if (!menu.name.includes(search)) {
      newMenu.children = newMenu.children?.filter(child => child.name.includes(search))
    }
    return newMenu;
  });
}

function MenuList(props: LoginState) {
  const [form] = useForm();
  const [search, setSearch] = useState<string>("");
  const columns: ColumnsType<SideMenu> = [
    {
      title: "编号",
      width: 100,
      align: "center",
      render: (text: any, record: SideMenu, index: number) => {
        return (index + 1) + "";
      }
    },
    {
      title: "图标",
      width: 80,
      align: "center",
      dataIndex: "icon",
      render: (icon: string, record: SideMenu) => {
        return <FontAwesomeIcon icon={icon}/>
      }
    },
    {
      title: "菜单名",
      dataIndex: "name",
      render: (text: string, record: SideMenu) => {
        text = text.replace(search, `<span style="color: red">${search}</span>`);
        return <span dangerouslySetInnerHTML={{ __html: text }}/>
      }
    },
    {
      title: "排序",
      dataIndex: "sort",
      width: 80,
      sorter: (a, b) => a.sort - b.sort,
      align: "center"
    },
    {
      title: "操作",
      width: 120,
      align: "center",
      render: (text, record: SideMenu) => {
        return [
          <Button
            type="link"
            icon={<EditOutlined/>}
            onClick={() => showMenuEditor(form, props.currentMenus, record)}/>
        ];
      }
    }
  ];
  const dataSource = filterMenus(search, props?.currentMenus);
  return <PageHeaderWrapper title={"菜单管理"}>
    <ProTable<SideMenu>
      columns={columns}
      rowKey="id"
      expandedRowKeys={dataSource?.length === props?.currentMenus?.length ? undefined : dataSource?.map(item => item.id)}
      dataSource={dataSource}
      search={false}
      toolBarRender={() => [
        <Button type="primary" onClick={() => {
          showMenuEditor(form, props?.currentMenus)
        }}>新建菜单</Button>,
        <Input.Search placeholder="搜索菜单" onSearch={value => setSearch(value)} allowClear/>
      ]}
      size="small"
      pagination={false}/>
  </PageHeaderWrapper>
}

export default connect(
  ({
     login
   }: ConnectState) => ({
    ...login
  }))(MenuList)