import React from "react";
import { Checkbox, Col, Empty, Form, Input, Row, Select, Switch, Tabs } from "antd";
import { TabsPosition } from "antd/lib/tabs";
import { Setting, SettingCategory } from "@/services/setting";
import { FormInstance } from "antd/lib/form";

export interface SettingFormProps {
  settings: SettingCategory[]
  catePosition?: TabsPosition
  form?: FormInstance
}

interface SettingFormState {
  currentHover?: Setting
}

export default class SettingForm extends React.Component<SettingFormProps, SettingFormState> {
  static defaultProps: Partial<SettingFormProps> = {
    catePosition: "left"
  };

  constructor(props: SettingFormProps) {
    super(props);
    this.state = {};
  }

  private renderFormItem = (setting: Setting) => {
    const { attribute, name, category, key, type, nullable } = setting;
    const props = JSON.parse(attribute || "{}");
    let child = null;
    switch (type) {
      case "switch":
        child = <Switch {...props}/>;
        break;
      case "select":
        child = <Select placeholder={`请选择${name}`}>

        </Select>;
        break;
      case "checkbox":
        child = <Checkbox.Group>

        </Checkbox.Group>;
        break;
      case "password":
        child = <Input.Password placeholder={`请输入${name}`} {...props}/>;
        break;
      case "textarea":
        child = <Input.TextArea rows={3} placeholder={`请输入${name}`} type={type} {...props}/>;
        break;
      default:
        child = <Input placeholder={`请输入${name}`} type={type} {...props}/>
    }
    return (
      <div onMouseOver={() => this.setState({ currentHover: setting })}>
        <Form.Item
          label={name}
          name={`${category}|${key}`}
          required={!nullable}>
          {child}
        </Form.Item>
      </div>
    )
  };


  render() {
    const { settings } = this.props;
    const initialValues = {};

    settings.forEach(cate => {
      cate.settings.forEach(item => {
        initialValues[`${item.category}|${item.key}`] = item.value;
      })
    });
    return (
      <Form initialValues={initialValues} layout={"vertical"} form={this.props.form}>
        <Tabs tabPosition={this.props.catePosition} style={{ minHeight: 200 }}>
          {settings.map(cate => <Tabs.TabPane key={`setting-category-${cate.id}`} tab={cate.name}>
            <Row gutter={20}>
              <Col span={14}>
                <div>
                  {cate.description}
                </div>
                {cate.settings.length ?
                  cate.settings.map(this.renderFormItem) :
                  <Empty description="该分类下暂无可用设置项"/>}
              </Col>
              <Col span={10}>
                {this.state.currentHover?.description}
              </Col>
            </Row>
          </Tabs.TabPane>)}
        </Tabs>
      </Form>
    );
  }
}
