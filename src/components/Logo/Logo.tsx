import React from 'react';
import styles from './styles.scss';

export interface LogoProps {
  size?: number;
}

export default class Logo extends React.Component<LogoProps> {
  static defaultProps: LogoProps = {
    size: 1,
  };

  private timer = 0;

  private times = 0;

  render() {
    return (
      <svg height={423} width={455} style={{ transform: `scale(${this.props.size})` }}>
        <defs>
          <linearGradient
            id="未命名的渐变_29"
            gradientTransform="matrix(0.71, -0.37, 0.71, 0.37, -252.57, 389.37)"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0.01" stopColor="#1586ff" />
            <stop offset="1" stopColor="#00c9ff" />
          </linearGradient>
          <linearGradient id="未命名的渐变_22" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#1290ff" />
            <stop offset="1" stopColor="#00c9ff" />
          </linearGradient>
          <linearGradient id="未命名的渐变_38" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#00c9ff" />
            <stop offset="0.49" stopColor="#01c7ff" />
            <stop offset="0.66" stopColor="#03c0ff" />
            <stop offset="0.79" stopColor="#06b5ff" />
            <stop offset="0.89" stopColor="#0ca4ff" />
            <stop offset="0.97" stopColor="#138eff" />
            <stop offset="1" stopColor="#1586ff" />
          </linearGradient>
          <linearGradient id="未命名的渐变_18" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#00c9ff" />
            <stop offset="1" stopColor="#1586ff" />
          </linearGradient>
          <linearGradient id="未命名的渐变_18-2" href="#未命名的渐变_18" />
          <linearGradient id="未命名的渐变_22-2" href="#未命名的渐变_22" />
        </defs>
        <rect
          id="svg_1"
          transform="rotate(45 288.6099853515622,-417.42001342773426) "
          height={132.6}
          width={95.24}
          onClick={this.onCenterClick}
          y="41.080002"
          x="645.639985"
          className={styles.cls1}
        />
        <polygon
          id="svg_2"
          points="216.010009765625,0.8800048828125 0.5700071454048157,216.32000732421875 85.25,216.32000732421875 301.2099914550781,0.3699951171875 216.010009765625,0.8800048828125 "
          className={styles.cls2}
        />
        <polygon
          id="svg_3"
          points="413.3699951171875,47.6300048828125 328.469970703125,47.6300048828125 265.5199890136719,110.57998657226562 330.59002685546875,110.57998657226562 413.3699951171875,47.6300048828125 "
          className={styles.cls3}
        />
        <polygon
          id="svg_4"
          points="330.21002197265625,110.57998657226562 265.5199890136719,110.57998657226562 370,216.10000610351562 369.77001953125,216.32000732421875 454.46002197265625,216.32000732421875 454.67999267578125,216.10000610351562 330.21002197265625,110.57998657226562 "
          className={styles.cls4}
        />
        <polygon
          id="svg_8"
          points="453.97998046875,216.75 369.28997802734375,216.75 161.75,424.28997802734375 296.44000244140625,424.28997802734375 453.97998046875,216.75 "
          className={styles.cls8}
        />
        <polygon
          id="svg_9"
          points="85.3900146484375,216.489990234375 85.55999755859375,216.32000732421875 0.8699951171875,216.32000732421875 0.5700071454048157,216.6199951171875 160.70001220703125,424.28997802734375 296.44000244140625,424.28997802734375 85.3900146484375,216.489990234375 "
          className={styles.cls9}
        />
      </svg>
    );
  }

  private onCenterClick = () => {
    this.timer && window.clearTimeout(this.timer);
    this.timer = window.setTimeout(() => {
      this.times = 0;
    }, 200);
    this.times += 1;
    if (this.times > 5) {
      alert(1);
    }
  };
}
