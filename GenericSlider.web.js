/* @flow */

import * as React from 'react';

import type { LayoutType, StyleType } from './flowtypes';

type PropTypes = {
  // TODO: support vertical, will do once needed
  orientation?: 'vertical' | 'horizontal',

  /* provide maximum and minimum inclusive value range and round function */
  value?: number,
  maximum?: number,
  minimum?: number,
  round?: (value: number) => number,
  onStart?: () => null,
  /* onMove doesn't necessarily need to update value passed through props -
     slider live updates on it's own */
  onMove?: (value: number) => null,
  /* onRelease must pass updated value through props or else slider will pop
     back to original value */
  onRelease?: (value: number) => null,

  /* override styling */
  layout?: LayoutType,
  fontColor?: string,
  sliderGradient?: [string, string],
  backgroundColor?: string,
  sliderMargin?: number,

  // TODO: for the futrue
  nightMode?: boolean
};

type StateType = {};

class GenericSlider extends React.Component<PropTypes, StateType> {

  render() {
    return (
      <div>

      </div>
    );
  }
}

module.exports = GenericSlider;
