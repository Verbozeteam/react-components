/* @flow */

import * as React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const GenericCircularSlider = require('./GenericCircularSlider');
const GenericToggle = require('./GenericToggle');

class ACControl extends React.Component<PropsType, StateType> {

  state = {
    fan_speed: 1,
    temperature: 22,
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
    this.setState({
      fan_speed: speed
    });
  }

  temperatureChange(temperature: number) {
    this.setState({
      temperature
    });
  }

  round(value: number) {
    console.log('round');
    return (Math.round(value * 2) / 2).toFixed(1);
  }

  formatText(text: string) {
    const { fan_speed } = this.state;
    console.log(text);

    if (fan_speed) {
      return text + '°C';
    }

    return 'Off';
  }

  render() {
    const { fan_speed, temperature, room_temperature } = this.state;

    return (
      <View style={styles.container}>
        <GenericCircularSlider value={temperature}
          minimum={16} maximum={30}
          round={this.round.bind(this)}
          formatText={this.formatText.bind(this)}
          onRelease={this.temperatureChange.bind(this)}/>
        <GenericToggle values={this._fan_speeds}
          icon={this._fan_icon}
          layout={{
            height: 70,
            width: 250
          }}
          actions={this._fan_actions} selected={fan_speed} />
        <Text style={styles.room_temperature}>
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
