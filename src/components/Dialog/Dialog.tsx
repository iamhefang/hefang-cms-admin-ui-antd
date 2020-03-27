import React, { ReactNode } from 'react';
import { Modal } from 'antd';
import { ModalProps } from 'antd/lib/modal';

interface DialogState {
  visible: boolean;
}

export interface DialogProps extends Omit<ModalProps, 'visible'> {
  content: ReactNode;
}

export default class Dialog extends React.Component<DialogProps, DialogState> {
  static success() {}

  constructor(props) {
    super(props);
    this.state = {
      visible: true,
    };
  }

  render() {
    const { content, ...props } = this.props;
    return (
      <Modal {...props} visible={this.state.visible}>
        {content}
      </Modal>
    );
  }
}
