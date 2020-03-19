import React, { RefObject, useContext, useEffect, useRef, useState } from "react";
import { DatePicker, Form, Input, InputNumber } from "antd";
import { FormInstance } from "antd/lib/form";
import classNames from "classnames";
import styles from "@/pages/menu/styles.less";
import EditableContext from "@/components/EditableProTable/EditableContext";
import { EditableProTableColumn } from "@/components/EditableProTable/EditableProTable";
import { execute } from "hefang-js";

const { TextArea, Password } = Input;

export interface EditableCellProps extends Pick<EditableProTableColumn<any>, "editable" | "editType"> {
  record?: any
  dataIndex?: string
  children?: any

  onSubmit?(values?: any): void
}

export default function EditableCell({ children, editable, dataIndex, record, editType, onSubmit, ...otherProps }: EditableCellProps) {
  const [editing, setEditing] = useState(false);
  const refInput = useRef() as RefObject<Input | InputNumber>;
  const form = useContext(EditableContext) as FormInstance;
  const onBlur = () => {
    setEditing(false);
    form.validateFields().then(values => execute(onSubmit, values, record));
  };
  useEffect(() => {
    editing && refInput?.current?.focus();
  }, [editing]);
  let childNode = children;
  if (editable && dataIndex) {
    let input;
    switch (editType) {
      case "number":
        input = <InputNumber ref={refInput as RefObject<any>} onBlur={onBlur}/>;
        break;
      case "textarea":
        input = <TextArea ref={refInput as RefObject<any>} onBlur={onBlur}/>;
        break;
      case "date":
      case "datetime":
        input = <DatePicker
          onBlur={onBlur}
          showTime={editType === "datetime"} ref={refInput as RefObject<any>}/>;
        break;
      case "password":
        input = <Password
          ref={refInput as RefObject<any>}
          onBlur={onBlur}/>;
        break;
      default:
        input = <Input
          ref={refInput as RefObject<Input>}
          type={editType}
          onBlur={onBlur}/>
    }
    childNode = editing ? (
      <Form.Item name={dataIndex} style={{ margin: 0 }} required>
        {input}
      </Form.Item>
    ) : (
      <div
        className={classNames(styles.editableField)}
        onClick={() => {
          setEditing(true);
          form.setFieldsValue({ [dataIndex]: record[dataIndex] })
        }}>
        {children}
      </div>
    )
  }
  return <td {...otherProps}>{childNode}</td>
}
