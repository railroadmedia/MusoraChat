import React from 'react';
import Svg, { Path } from 'react-native-svg';
export const menu = props => (
  <Svg
    viewBox='0 0 128 512'
    style={{
      fill: props.fill,
      width: props.width,
      height: props.height
    }}
  >
    <Path d='M64 208c26.5 0 48 21.5 48 48s-21.5 48-48 48-48-21.5-48-48 21.5-48 48-48zM16 104c0 26.5 21.5 48 48 48s48-21.5 48-48-21.5-48-48-48-48 21.5-48 48zm0 304c0 26.5 21.5 48 48 48s48-21.5 48-48-21.5-48-48-48-48 21.5-48 48z'></Path>
  </Svg>
);
export const sendMsg = props => (
  <Svg
    viewBox='0 0 48 48'
    version='1.1'
    style={{
      fillRule: 'evenodd',
      clipRule: 'evenodd',
      strokeLinejoin: 'round',
      width: props.width,
      height: props.height,
      fill: props.fill
    }}
  >
    <Path
      d='M4.02,42L46,24L4.02,6L4,20L34,24L4,28L4.02,42Z'
      style='fill-rule:nonzero;'
    />
  </Svg>
);
export const arrowLeft = props => (
  <Svg
    viewBox='8.63599967956543 2.2715001106262207 27.457000732421875 27.457000732421875'
    version='1.1'
    xmlns='http://www.w3.org/2000/svg'
    style={[
      props.style,
      {
        width: props.width,
        height: props.height
      }
    ]}
  >
    <Path
      fill={props.fill}
      id='arrow-left'
      d='M11.05,16l12.021,12.021c0.39,0.391 0.39,1.024 0,1.415c-0.39,0.39 -1.024,0.39 -1.414,0l-12.728,-12.728c-0.195,-0.196 -0.293,-0.452 -0.293,-0.708c0,-0.256 0.098,-0.512 0.293,-0.708l12.728,-12.728c0.39,-0.39 1.024,-0.39 1.414,0c0.39,0.391 0.39,1.024 0,1.415l-12.021,12.021Z'
    />
  </Svg>
);
export const pin = props => (
  <Svg
    viewBox='0 0 14 20'
    xmlns='http://www.w3.org/2000/svg'
    style={{
      width: props.width,
      height: props.height,
      aspectRatio: 14 / 20
    }}
  >
    <Path
      id='svg_4'
      fill={props.fill}
      fill-rule='evenodd'
      d='m11,7l0,-5l1,0c0.55,0 1,-0.45 1,-1l0,0c0,-0.55 -0.45,-1 -1,-1l-10,0c-0.55,0 -1,0.45 -1,1l0,0c0,0.55 0.45,1 1,1l1,0l0,5c0,1.66 -1.34,3 -3,3l0,0l0,2l5.97,0l0,7l1,1l1,-1l0,-7l6.03,0l0,-2l0,0c-1.66,0 -3,-1.34 -3,-3z'
    />
  </Svg>
);
export const vote = props => (
  <Svg
    viewBox='0 0 16 16'
    xmlns='http://www.w3.org/2000/svg'
    style={{
      width: props.width,
      height: props.height
    }}
  >
    <Path
      fill={props.fill}
      id='svg_2'
      d='m9,14.79125l0,-11.17l4.88,4.88c0.39,0.39 1.03,0.39 1.42,0c0.39,-0.39 0.39,-1.02 0,-1.41l-6.59,-6.59c-0.39,-0.39 -1.02,-0.39 -1.41,0l-6.6,6.58c-0.39,0.39 -0.39,1.02 0,1.41c0.39,0.39 1.02,0.39 1.41,0l4.89,-4.87l0,11.17c0,0.55 0.45,1 1,1s1,-0.45 1,-1z'
    />
  </Svg>
);
export const close = props => (
  <Svg
    viewBox='0 0 20 20'
    xmlns='http://www.w3.org/2000/svg'
    style={{
      width: props.width,
      height: props.height
    }}
  >
    <Path
      fill={props.fill}
      id='svg_2'
      d='m10,0c-5.53,0 -10,4.47 -10,10s4.47,10 10,10s10,-4.47 10,-10s-4.47,-10 -10,-10zm4.3,14.3c-0.39,0.39 -1.02,0.39 -1.41,0l-2.89,-2.89l-2.89,2.89c-0.39,0.39 -1.02,0.39 -1.41,0c-0.39,-0.39 -0.39,-1.02 0,-1.41l2.89,-2.89l-2.89,-2.89c-0.39,-0.39 -0.39,-1.02 0,-1.41c0.39,-0.39 1.02,-0.39 1.41,0l2.89,2.89l2.89,-2.89c0.39,-0.39 1.02,-0.39 1.41,0c0.39,0.39 0.39,1.02 0,1.41l-2.89,2.89l2.89,2.89c0.38,0.38 0.38,1.02 0,1.41z'
    />
  </Svg>
);
