/* @flow */

import * as React from 'react';

const GenericToggle = require('./presentational/GenericToggle');


type PropsType = {};
type StateType = {};

class LightSwitch extends React.Component<PropsType, StateType> {

  render() {
    return (
      <GenericToggle />
    );
  }
}

module.exports = LightSwitch;
