import React from 'react';
import { Col, Empty, Form, Input, Row, Select, Switch, Tabs } from 'antd';
import { TabsPosition } from 'antd/lib/tabs';
import { Setting, SettingCategory } from '@/services/setting';
import { FormInstance } from 'antd/lib/form';
import CKEditor from '@/components/CKEditor/CKEditor';
import memoizeOne from 'memoize-one';
import _ from 'lodash';
import { execute } from 'hefang-js';

export interface SettingFormProps {
  settings: SettingCategory[];
  catePosition?: TabsPosition;
  form?: FormInstance;
  formRef?: (form: FormInstance) => void;
}

interface SettingFormState {
  currentHover?: Setting;
}

export default class SettingForm extends React.Component<SettingFormProps, SettingFormState> {
  static defaultProps: Partial<SettingFormProps> = {
    catePosition: 'left',
  };

  private form: FormInstance | null = null;

  private initialValues = memoizeOne(settings => {
    const initialValues = {};
    settings.forEach((cate: { settings: Setting[] }) => {
      cate.settings.forEach(item => {
        initialValues[`${item.category}|${item.key}`] = item.value;
      });
    });
    return initialValues;
  });

  constructor(props: SettingFormProps) {
    super(props);
    this.state = {};
  }

  componentDidUpdate(prevProps: Readonly<SettingFormProps>): void {
    if (!_.isEqual(prevProps.settings, this.props.settings) && this.form) {
      this.form.setFieldsValue(this.initialValues(this.props.settings));
    }
  }

  private renderFormItem = (setting: Setting) => {
    const { attribute, name, category, key, type, nullable } = setting;
    const props = JSON.parse(attribute || '{}');
    let child = null;
    switch (type) {
      case 'switch':
        child = <Switch {...props} />;
        break;
      case 'select':
        child = <Select placeholder={`请选择${name}`} {...props} />;
        break;
      // case 'checkbox':
      //   child = <Checkbox.Group></Checkbox.Group>;
      //   break;
      case 'password':
        child = <Input.Password placeholder={`请输入${name}`} {...props} />;
        break;
      case 'textarea':
        child = <Input.TextArea rows={3} placeholder={`请输入${name}`} type={type} {...props} />;
        break;
      case 'html':
        child = <CKEditor placeholder={`请输入${name}`} />;
        break;
      default:
        child = <Input placeholder={`请输入${name}`} type={type} {...props} />;
    }
    return (
      <Form.Item
        label={name}
        name={`${category}|${key}`}
        rules={[{ required: !nullable, message: nullable ? undefined : '该项不能为空' }]}
      >
        {child}
      </Form.Item>
    );
  };

  render() {
    const { settings } = this.props;

    return (
      <Form
        initialValues={this.initialValues(settings)}
        layout="vertical"
        form={this.props.form}
        ref={form => {
          this.form = form;
          execute(this.props.formRef, form);
        }}
      >
        <Tabs tabPosition={this.props.catePosition} style={{ minHeight: 200 }}>
          {settings.map(cate => (
            <Tabs.TabPane key={`setting-category-${cate.id}`} tab={cate.name}>
              <Row gutter={20}>
                <Col span={14}>
                  <div>{cate.description}</div>
                  {cate.settings.length ? (
                    cate.settings.map(this.renderFormItem)
                  ) : (
                    <Empty description="该分类下暂无可用设置项" />
                  )}
                </Col>
                <Col span={10}>{this.state.currentHover?.description}</Col>
              </Row>
            </Tabs.TabPane>
          ))}
        </Tabs>
      </Form>
    );
  }
}
