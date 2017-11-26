/* @flow */

import * as React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const GenericCircularSlider = require('./GenericCircularSlider');
const GenericToggle = require('./GenericToggle');

type PropTypes = {
  fontColor?: string
};

class ACControl extends React.Component<PropTypes, StateType> {

  static defaultProps = {
    fontColor: '#FFFFFF'
  };

  state = {
    fan_speed: 1,
    temperature: 22,
    temperatureDisabled: false
  };

  _fan_speeds = [
    'Off',
    'Low',
    'High'
  ];

  _fan_actions = [
    () => this.changeFan(0),
    () => this.changeFan(1),
    () => this.changeFan(2)
  ];

  _fan_icon = require('./assets/fan.png');

  changeFan(speed: number) {
    var temperatureDisabled = false;
    if (speed == 0) {
      temperatureDisabled = true;
    }

    this.setState({
      fan_speed: speed,
      temperatureDisabled,
    });
  }

  temperatureChange(temperature: number) {
    this.setState({
      temperature
    });
  }

  round(value: number): number {
    return parseFloat((Math.round(value * 2) / 2).toFixed(1));
  }

  formatText(value: number) {
    const { fan_speed } = this.state;

    if (fan_speed) {
      return value.toFixed(1) + '°C';
    }
    return 'Off';
  }

  render() {
    const { fontColor } = this.props;
    const { fan_speed, temperature, room_temperature, temperatureDisabled }
      = this.state;

    return (
      <View style={styles.container}>
        <GenericCircularSlider value={temperature}
          minimum={16} maximum={30}
          round={this.round.bind(this)}
          disabled={temperatureDisabled}
          fontColor={fontColor}
          formatText={this.formatText.bind(this)}
          onRelease={this.temperatureChange.bind(this)}/>
        <GenericToggle values={this._fan_speeds}
          icon={this._fan_icon}
          layout={{
            height: 70,
            width: 250
          }}
          actions={this._fan_actions}
          selected={fan_speed} />
        <Text style={[styles.room_temperature, {color: fontColor}]}>
          Room Temperature is 25°C
        </Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  room_temperature: {
    marginTop: 20,
    fontSize: 22,
    fontWeight: 'bold'
  }
});

module.exports = ACControl;
