import React, { CSSProperties } from 'react';
import { Button, Col, Empty, Form, Input, Row, Select, Switch, Tabs, Tooltip } from 'antd';
import { TabsPosition } from 'antd/lib/tabs';
import { Setting, SettingCategory } from '@/services/setting';
import { FormInstance } from 'antd/lib/form';
import CKEditor from '@/components/CKEditor/CKEditor';
import memoizeOne from 'memoize-one';
import _ from 'lodash';
import { execute } from 'hefang-js';
import { InfoCircleOutlined } from '@ant-design/icons/lib';

export interface SettingFormProps {
  settings: SettingCategory[];
  catePosition?: TabsPosition;
  form?: FormInstance;
  formRef?: (form: FormInstance) => void;
  showRightInfo?: boolean;
  paneStyle?: CSSProperties;
}

interface SettingFormState {
  currentHover?: Setting;
}

export default class SettingForm extends React.Component<SettingFormProps, SettingFormState> {
  static defaultProps: Partial<SettingFormProps> = {
    catePosition: 'left',
    showRightInfo: true,
  };

  private form: FormInstance | null = null;

  private initialValues = memoizeOne(settings => {
    const initialValues = {};
    settings.forEach((cate: { settings: Setting[] }) => {
      cate.settings.forEach(item => {
        if (!item.showInCenter) return;
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
            <Tabs.TabPane
              key={`setting-category-${cate.id}`}
              tab={cate.name}
              style={_.merge({ paddingRight: 15, boxSizing: 'border-box' }, this.props.paneStyle)}
            >
              <Row gutter={20}>
                <Col span={this.props.showRightInfo ? 14 : 24}>
                  <div>{cate.description}</div>
                  {cate.settings.length ? (
                    cate.settings.filter(item => item.showInCenter).map(this.renderFormItem)
                  ) : (
                    <Empty description="该分类下暂无可用设置项" />
                  )}
                </Col>
                {this.props.showRightInfo ? (
                  <Col span={10}>{this.state.currentHover?.description}</Col>
                ) : null}
              </Row>
            </Tabs.TabPane>
          ))}
        </Tabs>
      </Form>
    );
  }

  private renderFormItem = (setting: Setting) => {
    const { attribute, name, category, key, type, nullable, description } = setting;
    const props = JSON.parse(attribute || '{}');
    let child = null;
    let valuePropName = 'value';
    switch (type) {
      case 'switch':
        child = <Switch {...props} />;
        valuePropName = 'checked';
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
        label={
          <>
            {name}{' '}
            {description ? (
              <Tooltip title={description} placement="right">
                <Button
                  icon={<InfoCircleOutlined style={{ cursor: 'help' }} />}
                  size="small"
                  type="link"
                />
              </Tooltip>
            ) : (
              nullable
            )}
          </>
        }
        name={`${category}|${key}`}
        valuePropName={valuePropName}
        rules={[{ required: !nullable, message: nullable ? undefined : '该项不能为空' }]}
      >
        {child}
      </Form.Item>
    );
  };
}
