/* @flow */

import * as React from 'react';
import { View, StyleSheet, PanResponder } from 'react-native';
import Svg, { Line, Polygon } from 'react-native-svg';

type PropsType = {
  width: number,
  height: number,
  margin?: number,

  value: number,
  enabled?: boolean,
  onChange?: (n: number) => any,
  round?: (n: number) => number | string,

  numDashes?: number,
  minTemp?: number,
  maxTemp?: number,
  coldColor?: string,
  warmColor?: string,
  disabledColor?: string,
  knobColor?: string,

  scrollStart: () => {},
  scrollEnd: () => {}
};

type StateType = {
  dragging: boolean,
  last_value: number,
  current_value: number
};

export default class MagicThermostatSlider extends React.Component<PropsType, StateType> {

  static defaultProps = {
    margin: 10,

    enabled: true,
    onChange: (n: number) => null,
    round: (n: number) => n,

    numDashes: 35,
    minTemp: 16,
    maxTemp: 32,
    coldColor: '#2F75B8',
    warmColor: '#BA3737',
    disabledColor: '#707070',
    knobColor: '#D8D8D8',

    scrollStart: () => {},
    scrollEnd: () => {},
  };

  state = {
    dragging: false,
    last_value: 0,
    current_value: 0
  };

  /* touch responder */
  _panResponder: ?Object;

  /* component x-axis position relative to screen */
  _x_pos: ?number;
  _measured: boolean = false;

  /* reference to container object used to obtain component position */
  _container_ref: React.Ref<View>;

  componentWillMount() {
    /* create touch responder */
    this._panResponder = PanResponder.create({
      onStartShouldSetPanResponder: (evt, gestureState) => true,
      onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => true,
      onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,

      onPanResponderGrant: this.onPanResponderGrant.bind(this),
      onPanResponderMove: this.onPanResponderMove.bind(this),
      onPanResponderRelease: this.onPanResponderRelease.bind(this)
    });
  }

  onPanResponderGrant(evt: Object, gestureState: Object) {
    const { scrollStart } = this.props;
    scrollStart();
    this.measure(() => this.onKnobMove(gestureState.x0));
  }

  onPanResponderMove(evt: Object, gestureState: Object) {
    if (this._measured) {
      this.onKnobMove(gestureState.moveX);
    }
  }

  onPanResponderRelease(evt: Object, gestureState: Object) {
    const { scrollEnd } = this.props;
    scrollEnd();

    this._measured = false;

    this.setState({
      dragging: false
    });
  }

  onKnobMove(x: number) {
    const { margin, width, minTemp, maxTemp, round, onChange, enabled } = this.props;
    const { last_value, current_value } = this.state;

    if (!enabled)
      return;

    var new_value = (x - this._x_pos - margin / 2) / (width - margin) *
      minTemp + (maxTemp - minTemp);
    new_value = round(Math.min(Math.max(new_value, minTemp), maxTemp));

    if (new_value != last_value && onChange) {
      onChange(new_value);
    }

    this.setState({
      dragging: true,
      last_value: current_value,
      current_value: new_value
    });
  }

  parseColor(color: string): {r: number, g: number, b: number} {
    return {
      r: parseInt(color.slice(1, 3), 16),
      g: parseInt(color.slice(3, 5), 16),
      b: parseInt(color.slice(5), 16)
    };
  }

  renderLines() {
    const { width, height, numDashes, disabledColor, margin, enabled }
      = this.props;
    var { coldColor, warmColor } = this.props;

    const parsedColdColor = this.parseColor(coldColor);
    const parsedWarmColor = this.parseColor(warmColor);

    var lines = [];

    var bar_width = width - margin;
    var bar_height = (height - 3) * 0.4;

    for (var i = 0; i < numDashes; i++) {
      var progress = i / (numDashes - 1);
      var lerp = (v, c) => (parsedColdColor[c] +
        (parsedWarmColor[c] - parsedColdColor[c]) * v).toFixed(0);

      var color;
      if (enabled) {
        color = 'rgb(' + lerp(progress, 'r') + ',' + lerp(progress, 'g') +
        ',' + lerp(progress, 'b') + ')';
      } else {
        color = disabledColor;
      }

      var x = progress * (bar_width - 2) + 1;
      lines.push(
        <Line key={'svg-line-' + i}
          x1={x} y1={0} x2={x} y2={bar_height} stroke={color} strokeWidth={2} />
      );
    }

    return lines;
  }

  renderKnob() {
    const { height, disabledColor, enabled } = this.props;
    var { knobColor } = this.props;

    if (!enabled) {
      knobColor = disabledColor;
    }

    var knob_width = (height - 3) * 0.8;
    var knob_height = (height - 3) * 0.6;

    return (
      <Svg width={knob_width} height={knob_height}>
        <Polygon points={'0,0 ' + knob_width + ',0 ' + knob_width / 2 + ',' + knob_height}
          fill={knobColor}
          stroke={'#FFFFFF'}
          stokeWidth={'2'} />
      </Svg>
    )
  }

  knobPosition() {
    const { width, margin, minTemp, maxTemp } = this.props;
    var { value } = this.props;
    const { dragging, current_value } = this.state;

    if (dragging) {
      value = current_value;
    }

    return (width - margin) * (value - minTemp) / (maxTemp - minTemp);
  }

  measure(callback?: Function = () => null) {
    this._container_ref.measure((x, y, width, height, pageX, pageY) => {
      this._x_pos = pageX;
      callback();
      this._measured = true;
    });
  }

  render() {
      var { width, height, margin } = this.props;

      var bar_width = width - margin;
      var bar_height = (height - 3) * 0.4;

      const knob_style = {
        marginLeft: this.knobPosition(),
        marginBottom: 3
      };

      /* empty onLayout callback, but needed for measure to work on Android */
      return (
        <View style={{width, height}}
          ref={(c) => this._container_ref = c}
          onLayout={() => null}
          {...this._panResponder.panHandlers}>
          <View style={knob_style}>
            {this.renderKnob()}
          </View>

          <Svg width={bar_width} height={bar_width}
            style={{marginLeft: margin / 2}}>
            {this.renderLines()}
          </Svg>
        </View>
      );
  }
}
