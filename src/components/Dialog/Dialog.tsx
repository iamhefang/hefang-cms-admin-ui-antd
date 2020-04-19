import React, { PropsWithChildren } from 'react';
import { Modal } from 'antd';
import { ModalFuncProps, ModalProps } from 'antd/lib/modal';
import { render, unmountComponentAtNode } from 'react-dom';

export interface DialogProps extends ModalFuncProps {}

export interface DialogState {}

function props2props(props: DialogProps): PropsWithChildren<ModalProps> {
  const {
    icon,
    title,
    content,
    okText,
    cancelText,
    okButtonProps,
    cancelButtonProps,
    onOk,
    onCancel,
  } = props;

  return {
    children: content,
    title: (
      <>
        {icon}
        {title}
      </>
    ),
    okText,
    cancelText,
    okButtonProps,
    cancelButtonProps,
    onOk,
    onCancel,
    visible: true,
  };
}

export default class Dialog extends React.Component<DialogProps, DialogState> {
  static confirm(props: DialogProps) {
    const root = document.createElement('div') as HTMLDivElement;
    document.body.appendChild(root);
    render(<Modal {...props2props(props)} />, root);
    return {
      update(newProps: ModalFuncProps) {
        render(<Modal {...props2props(newProps)} />, root);
      },
      destroy() {
        unmountComponentAtNode(root);
      },
    };
  }

  render() {
    return <Modal {...this.props} />;
  }
}
