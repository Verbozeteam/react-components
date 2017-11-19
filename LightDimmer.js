/* @flow */

import * as React from 'react';

const GenericSlider = require('./presentational/GenericSlider');

type PropsType = {
  id: string,
  update: () => null
};

type StateType = {
  intensity: number
};

class LightDimmer extends React.Component<PropsType, StateType> {

  state = {
    intensity: 0
  };

  /* props to be passed to GenericSlider */
  _maximum_value: number = 100;
  _minimum_value: number = 0;

  round(value: number) {
    return Math.round(value);
  }

  changeIntensity(intensity: number) {
    this.setState({
      intensity
    });
  }

  render() {
    const { intensity } = this.state;

    return (
      <GenericSlider value={intensity}
        orientation={'vertical'}
        maximum={this._maximum_value}
        minimum={this._minimum_value}
        round={this.round.bind(this)}
        onRelease={this.changeIntensity.bind(this)} />
    );
  }
}

module.exports = LightDimmer;
