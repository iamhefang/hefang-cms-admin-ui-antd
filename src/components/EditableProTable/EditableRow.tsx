import { useForm } from "antd/lib/form/util";
import { Form } from "antd";
import React from "react";
import EditableContext from "./EditableContext";

export interface EditableRowProps {

}

export default function EditableRow(props: EditableRowProps) {
  const [form] = useForm();
  return <Form form={form} component={false}>
    <EditableContext.Provider value={form}>
      <tr {...props}/>
    </EditableContext.Provider>
  </Form>
}
