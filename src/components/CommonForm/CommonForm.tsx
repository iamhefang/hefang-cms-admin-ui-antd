import { Form } from "antd";
import React from "react";
import { FormInstance, FormItemProps, FormProps } from "antd/lib/form";

export type CommonFormProps = FormProps & React.RefAttributes<FormInstance> & {
  itemLayout?: any
  items: FormItemProps[]
}


export default function CommonForm(props: CommonFormProps) {
  const { itemLayout, items, ...formProps } = props;
  return <Form {...formProps}>
    {items.map(item => <Form.Item key={`common-form-item-${item.name}${item.label}`} {...item}/>)}
  </Form>
}
