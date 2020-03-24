import { Form, Input, Modal, Select } from 'antd';
import { Category } from '@/models/article';
import React from 'react';
import { render } from 'react-dom';
import { FormInstance } from 'antd/lib/form';
import _ from 'lodash';

export type CategoryEditorProps = Partial<Category> & {};

let container: HTMLDivElement | null = null;

export default class CategoryEditorForm extends React.Component<CategoryEditorProps> {
  private refForm = React.createRef<FormInstance>();

  static show(props?: CategoryEditorProps) {
    container =
      container ||
      (() => {
        const div = document.createElement('div') as HTMLDivElement;
        document.body.appendChild(div);
        return div;
      })();
    render(<CategoryEditorForm {...props} />, container);
  }

  render() {
    return (
      <Modal
        visible
        okText="保存"
        onOk={() => {
          this.refForm.current
            ?.validateFields()
            ?.then(console.dir)
            .catch(console.error);
        }}
        title={this.props.id ? `修改分类` : '新建分类'}
      >
        <Form
          layout="vertical"
          initialValues={_.merge({ keywords: null, description: null }, this.props)}
          ref={this.refForm}
          onFinish={console.dir}
        >
          <Form.Item label="类型" name="type">
            <Select disabled={!!this.props.type}>
              <Select.Option value="article">文章</Select.Option>
              <Select.Option value="file">文件</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="分类名"
            name="name"
            required
            rules={[{ message: '分类名不能为空', required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item label="关键字" name="keywords">
            <Input.TextArea maxLength={150} rows={2} />
          </Form.Item>
          <Form.Item label="描述" name="description">
            <Input.TextArea maxLength={200} rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    );
  }
}
