/* @flow */

import * as React from 'react';

const GenericToggle = require('./GenericToggle');

type PropsType = {
  id: string,
  update: () => null
};

type StateType = {
  intensity: number
};

class LightSwitch extends React.Component<PropsType, StateType> {

  state = {
    intensity: 0
  }

  /* props to be passed to GenericToggle */
  _values : [string, string] = [
    'On',
    'Off'
  ];

  _actions : [() => null, () => null] = [
    this.turnOn.bind(this),
    this.turnOff.bind(this)
  ];

  turnOn() {
    this.setState({
      intensity: 1
    });
  }

  turnOff() {
    this.setState({
      intensity: 0
    });
  }

  render() {
    const { intensity } = this.state;

    var selected = 0;
    if (!intensity) {
      selected = 1;
    }

    return (
      <GenericToggle selected={selected}
        values={this._values}
        actions={this._actions} />
    );
  }
}

module.exports = LightSwitch;
