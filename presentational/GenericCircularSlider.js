/* @flow */

import * as React from 'react';
import { View, Text, StyleSheet, PanResponder } from 'react-native';

import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

type PropsType = {
  /* size of the circular arc in degrees */
  arc: number,

  /* provide maximum and minimum inclusive range and round function */
  value?: number,
  maximum?: number,
  minimum?: number,
  round?: (value: number) => number,
  onStart?: () => null,
  /* onMove doesn't necessarily need to update value passed through props -
     circular slider live updates on it's own */
  onMove?: (value: number) => null,
  /* onRelease must pass updated value through props or else slider will pop
     back to original value */
  onRelease?: (value: number) => null,

  /* override styling */
  layout?: LayoutType,

  // TODO: for the future
  nightMode?: boolean
};

type StateType = {
  touch: boolean,
  touch_value: number,
  touch_start_value: number
}

class GenericCircularSlider extends React.Component<PropsType, StateType> {

  static defaultProps = {
    arc: 270,
    value: 50,
    maximum: 100,
    minimum: 0,
    round: (value) => Math.round(value),
    onStart: () => null,
    onMove: () => null,
    onRelease: () => null,
  };

  state = {
    touch: false,
    touch_value: 0,
    touch_start_value: 0
  };

  _diameter: number = 300;

  /* touch responder */
  _panResponder: Object;

  componentWillMount() {

    /* create touch responder */
    this._panResponder = PanResponder.create({
      onStartShouldSetPanResponder: (evt, gestureState) => true,
      onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => true,
      onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,

      onPanResponderGrant: this._onPanResponderGrant.bind(this),
      onPanResponderMove: this._onPanResponderMove.bind(this),
      onPanResponderRelease: this._onPanResponderRelease.bind(this)
    });
  }

  _onPanResponderGrant() {

  }

  _onPanResponderMove() {

  }

  _onPanResponderRelease() {

  }

  render() {

    const radius = this._diameter / 2;
    const width = 50;

    return (
      <View style={[styles.container, {height: this._diameter, width: this._diameter}]}>
        <Svg width={this._diameter} height={this._diameter}>
          <Defs>
            <LinearGradient id={'gradient'} x1={0} y1={radius} x2={this._diameter} y2={radius}>
              <Stop offset={'0'} stopColor={'#2368AE'} />
              <Stop offset={'1'} stopColor={'#F03B4B'} />
            </LinearGradient>
          </Defs>
          <Circle cx={radius} cy={radius} r={radius - width / 2} stroke={'url(#gradient)'} strokeWidth={width} fill={'none'}/>
          {/* <Circle cx={radius} cy={radius} r={radius - width} stroke={'#0000FF'} strokeWidth={width} fill={'none'}/> */}
        </Svg>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
  },
  header: {

  }
});

module.exports = GenericCircularSlider;
