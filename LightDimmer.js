/* @flow */

import * as React from 'react';

const GenericSlider = require('./presentational/GenericSlider');

import type { LayoutType, StyleType } from './flowtypes';

type PropsType = {
  id: string,
  intensity: number,
  update: (id: string, object: Object) => null,

  /* all of the following props are passed through to GenericSlider */
  orientation?: 'vertical' | 'horizontal',
  maximum?: number,
  minimum?: number,
  round?: (value: number) => number,

  layout?: LayoutType,
  fontColor?: string,
  sliderGradient?: [string, string],
  backgroundColor?: string,
  sliderMargin?: number,
};

class LightDimmer extends React.Component<PropsType, StateType> {

  static defaultProps = {
    orientation: 'vertical',
    maximum: 100,
    minimum: 0,
    round: (value: number) => Math.round(value),
  };

  changeIntensity(intensity: number) {
    const { id, update } = this.props;

    /* call passed in update callback */
    update(id, {intensity});
  }

  render() {
    const { intensity } = this.props;

    return (
      <GenericSlider value={intensity}
        {...this.props}
        onMove={this.changeIntensity.bind(this)}
        onRelease={this.changeIntensity.bind(this)} />
    );
  }
}

module.exports = LightDimmer;
