import React from 'react';
import Svg, { Path, Polygon } from 'react-native-svg';
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
export const coach = props => (
  <Svg
    xmlns='http://www.w3.org/2000/svg'
    viewBox='0 0 46.3 36.4'
    style={{
      width: props.width,
      height: props.height,
      aspectRatio: 46.3 / 36.4
    }}
  >
    <Polygon
      fill={props.fill}
      class='st0'
      points='23.2,9.3 25.1,11.7 30.3,8.6 27.9,6.4 	'
    />
    <Path
      fill={props.fill}
      class='st0'
      d='M46.3,20.7C40.8,14.3,34.9,8.3,28.7,2.6C23.6-1.4,14.3-1.1,5.5,5.9l-1.2,1C4.3,6.9,4.2,7,4.1,7
		c-5.1,4.6-5.5,12.4-1,17.6c3.9,5.6,11.6,7,17.3,3.2c1.1-1.1,2-2.3,2.7-3.7l10.4,12.3l12.5-8.3L46.3,20.7L46.3,20.7L46.3,20.7z
		 M43.6,27.1l-6.1,3.7v-1.7l6.1-3.7V27.1z M35.2,27L21.5,10.3c0,0-0.1-0.1-0.1-0.1c-0.1-0.1-0.2-0.2-0.3-0.3l-0.3-0.4
		c-2.5-2.9-6.1-4.6-9.9-4.7C17.3,1.4,23.7,1,27.5,4c6,5.5,11.7,11.4,17.1,17.6L35.2,27z'
    />
  </Svg>
);
export const team = props => (
  <Svg
    xmlns='http://www.w3.org/2000/svg'
    viewBox='0 0 80.5 25.5'
    style={{
      width: props.width,
      height: props.height,
      aspectRatio: 80.5 / 25.5
    }}
  >
    <Path
      fill={props.fill}
      class='st0'
      d='M6.3,5.8V25h6.3V5.8h6.3V0.4H0v5.8L6.3,5.8z M33.5,0.4H18.3v25H34v-5.8h-9.4v-4.5h8.5V9.4h-8.5
	V5.8H34V0.4H33.5z M51,25h6.3v-0.9L46.1,0h-2.7L32.2,24.2V25h6.3l1.3-3.1h9.8L51,25z M47.4,16.5h-5.8l3.1-6.3L47.4,16.5z M68.4,11.2
	L58.6,0.4h-2.2v25h6.3V14.3l5.4,5.4h0.9l5.4-5.4v11.2h6.3v-25h-2.2L68.4,11.2z'
    />
  </Svg>
);
export const edge = props => (
  <Svg
    xmlns='http://www.w3.org/2000/svg'
    viewBox='0 0 65.8 24.2'
    style={{
      width: props.width,
      height: props.height,
      aspectRatio: 65.8 / 24.2
    }}
  >
    <Path
      fill={props.fill}
      class='st0'
      d='M47.7,15h-5.9v-3.5h9.5l0,0c0,1.2,0,2.4-0.4,3.5c-0.4,2-1.2,3.9-2.8,5.5
	c-0.8,1.6-2.4,2.8-3.9,3.2C43,24,41.4,24.4,39.8,24c-1.6,0-2.8-0.4-3.9-1.2c-1.2-0.4-2.4-1.2-3.2-2c-0.8-0.8-1.6-1.6-2-2.4l0,0
	c-0.4,0.4-0.4,0.8-0.8,1.2c-1.6,2-3.5,3.2-5.9,3.9C22.9,24,21.7,24,20.9,24c-2.4,0-4.3,0-6.7,0l0,0V0l0,0c1.6,0,3.5,0,5.1,0
	c1.6,0,3.2,0,4.7,0.4c2.8,0.8,5.1,2.4,6.7,5.1l0,0l0,0c1.2-2,3.2-3.5,5.5-4.7C37.4,0.4,39,0,40.2,0c3.2,0,5.9,0.8,8.3,2.8
	c0.8,0.4,1.2,1.2,1.6,1.6l0,0l-2.4,2.4l-0.4-0.4c-0.8-1.2-2-2-3.2-2.8c-1.2-0.8-2.4-0.8-3.9-0.8c-1.2,0.8-2.8,1.2-4.3,2.4
	c-1.6,1.2-2.8,2.8-3.2,5.1c-0.4,2-0.4,3.9,0.8,5.9c0.8,1.2,1.6,2.4,3.2,3.2c0.8,0.8,1.6,1.2,2.8,1.6c2,0.4,4.3-0.4,5.9-1.6
	c1.2-1.2,2-2.4,2-3.5C47.7,15.4,47.7,15.4,47.7,15z M52.4,24L52.4,24V0l0,0h13v3.5l0,0H56v5.9h5.1l0,0c-0.8,1.2-1.6,2-2,3.2l0,0
	c-0.8,0-1.6,0-2.8,0l0,0v7.9h9.5l0,0V24H52.4L52.4,24z M13,3.5H3.5v5.9h5.1l0,0c-0.8,0.8-1.2,2-2,3.2c0,0,0,0-0.4,0H3.5v7.9H13V24H0
	V0h13V3.5z M17.7,20.9L17.7,20.9h2c0.8,0,1.6,0,2.8-0.4c2.8-0.4,5.1-2.4,5.9-5.1c0.8-2,0.8-4.7,0-6.7c-0.8-1.6-2-2.8-3.2-3.9
	c-1.2-0.8-2.8-1.2-4.3-1.2c-1.2,0-2.4,0-3.5,0l0,0L17.7,20.9z'
    />
  </Svg>
);
export const lifetime = props => (
  <Svg
    xmlns='http://www.w3.org/2000/svg'
    viewBox='0 0 63.1 30.1'
    style={{
      width: props.width,
      height: props.height,
      aspectRatio: 63.1 / 30.1
    }}
  >
    <Path
      fill={props.fill}
      class='st0'
      d='M48,0c-5.5,0.3-10.6,2.9-14.2,7.1c1.2,1.5,2.3,3.1,3.3,4.7l0.2,0.3c2.6-3.5,6.5-5.7,10.8-6.1
	c5,0.1,9,4.3,8.9,9.3c-0.1,4.9-4,8.8-8.9,8.9c-7.8,0-14-10.5-14-10.6C33.7,13,26.1,0,14.8,0C6.5,0.1-0.1,7,0,15.3
	C0.1,23.4,6.7,30,14.8,30.1c5.5-0.3,10.6-2.9,14.2-7.1c-1.2-1.5-2.3-3.1-3.3-4.7l-0.2-0.3c-2.6,3.4-6.5,5.7-10.7,6.1
	c-5,0.1-9.2-3.9-9.3-8.9c-0.1-5,3.9-9.2,8.9-9.3c0.1,0,0.3,0,0.4,0c7.8,0,14,10.5,14,10.6c0.3,0.6,7.9,13.6,19.2,13.6
	c8.3,0,15.1-6.7,15.1-15.1C63.1,6.8,56.3,0,48,0z'
    />
  </Svg>
);
export const x = props => (
  <Svg
    viewBox='0 0 32 32'
    version='1.1'
    style={{ height: props.height, width: props.width, fill: props.fill }}
  >
    <Path
      id='X'
      fill={props.fill}
      d='M16,14.586l8.485,-8.485c0.391,-0.391 1.024,-0.391 1.414,0c0.391,0.39 0.391,1.023 0,1.414l-8.485,8.485l8.485,8.485c0.391,0.391 0.391,1.024 0,1.414c-0.39,0.391 -1.023,0.391 -1.414,0l-8.485,-8.485l-8.485,8.485c-0.391,0.391 -1.024,0.391 -1.414,0c-0.391,-0.39 -0.391,-1.023 0,-1.414l8.485,-8.485l-8.485,-8.485c-0.391,-0.391 -0.391,-1.024 0,-1.414c0.39,-0.391 1.023,-0.391 1.414,0l8.485,8.485Z'
    />
  </Svg>
);
export const arrowDown = props => (
  <Svg
    viewBox='0 0 437 438'
    style={{ height: props.height, width: props.width, aspectRatio: 437 / 438 }}
  >
    <Path
      fill={props.fill}
      d='M407.4499999046326,190.5 l22.2,22.2 c9.4,9.4 9.4,24.6 0,33.9 L235.34999990463257,441 c-9.4,9.4 -24.6,9.4 -33.9,0 L7.049999904632568,246.60000000000002 c-9.4,-9.4 -9.4,-24.6 0,-33.9 l22.2,-22.2 c9.5,-9.5 25,-9.3 34.3,0.4 L178.34999990463257,311.4 V24 c0,-13.3 10.7,-24 24,-24 h32 c13.3,0 24,10.7 24,24 v287.4 l114.8,-120.5 c9.3,-9.8 24.8,-10 34.3,-0.4 z'
      id='svg_1'
      class=''
    />
  </Svg>
);
export const pdf = props => (
  <Svg width={props.width} height={props.height} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <Path
      d="M6.00016 8H10.0002M6.00016 10.6667H10.0002M11.3335 14H4.66683C3.93045 14 3.3335 13.403 3.3335 12.6667V3.33333C3.3335 2.59695 3.93045 2 4.66683 2H8.39069C8.5675 2 8.73707 2.07024 8.86209 2.19526L12.4716 5.80474C12.5966 5.92976 12.6668 6.09933 12.6668 6.27614V12.6667C12.6668 13.403 12.0699 14 11.3335 14Z"
      stroke={props.fill}
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
export const download = props => (
  <Svg width={props.width} height={props.height} viewBox="0 0 18 18" fill="none" >
    <Path
      d="M2.99988 12L2.99988 12.75C2.99988 13.9926 4.00724 15 5.24988 15L12.7499 15C13.9925 15 14.9999 13.9926 14.9999 12.75L14.9999 12M11.9999 9L8.99988 12M8.99988 12L5.99988 9M8.99988 12L8.99988 3"
      stroke={props.fill}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
export const chat = props => (
  <Svg width={props.width} height={props.height} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <Path
      d="M5.33333 8.00002H5.34M8 8.00002H8.00667M10.6667 8.00002H10.6733M14 8.00002C14 10.9455 11.3137 13.3334 8 13.3334C6.97382 13.3334 6.00781 13.1044 5.16311 12.7007L2 13.3334L2.92999 10.8534C2.34104 10.0282 2 9.04954 2 8.00002C2 5.0545 4.68629 2.66669 8 2.66669C11.3137 2.66669 14 5.0545 14 8.00002Z"
      stroke={props.fill}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
export const questions = props => (
  <Svg width={props.width} height={props.height} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <Path
      d="M5.48511 6C5.85118 5.22321 6.83895 4.66667 8.00004 4.66667C9.4728 4.66667 10.6667 5.5621 10.6667 6.66667C10.6667 7.59963 9.81496 8.38338 8.66285 8.6044C8.30125 8.67377 8.00004 8.96514 8.00004 9.33333M8 11.3333H8.00667M14 8C14 11.3137 11.3137 14 8 14C4.68629 14 2 11.3137 2 8C2 4.68629 4.68629 2 8 2C11.3137 2 14 4.68629 14 8Z"
      stroke={props.fill}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
export const resources = props => (
  <Svg width={props.width} height={props.height} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <Path
      d="M8.00016 6.66667V10.6667M8.00016 10.6667L6.00016 8.66667M8.00016 10.6667L10.0002 8.66667M11.3335 14H4.66683C3.93045 14 3.3335 13.403 3.3335 12.6667V3.33333C3.3335 2.59695 3.93045 2 4.66683 2H8.39069C8.5675 2 8.73707 2.07024 8.86209 2.19526L12.4716 5.80474C12.5966 5.92976 12.6668 6.09933 12.6668 6.27614V12.6667C12.6668 13.403 12.0699 14 11.3335 14Z"
      stroke={props.fill}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"/>
  </Svg>
);

