import React, { HTMLAttributes } from 'react';
import classNames from 'classnames';
import { Modal } from 'antd';

export type FontAwesomeIconProps = HTMLAttributes<HTMLElement> & {
  icon: string;
  type?: 'fa' | 'far' | 'fas' | 'fab';
};

const FAS = ['dice-d6'];

export default class FontAwesomeIcon extends React.Component<FontAwesomeIconProps> {
  static picker() {
    return new Promise(() => {
      Modal.confirm({
        title: '选择图标',
        width: '80vw',
        style: { maxWidth: 1000 },
        content: <>111</>,
      });
    });
  }

  render() {
    const { icon, className = '', type, ...attrs } = this.props;
    const realType = type || (FAS.includes(icon) ? 'fas' : 'fa');
    return (
      <span className="anticon">
        <i
          {...attrs}
          className={classNames(className, realType, `fa-${icon}`)}
          aria-label={`icon ${icon}`}
        />
      </span>
    );
  }
}
