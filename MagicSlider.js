/* @flow */

import * as React from 'react';
import PropTypes from 'prop-types';
import { View, Text, StyleSheet, PanResponder } from 'react-native';

type PropsType = {
  width: number,
  height: number,
  value: number,
  maxValue: number,
  increment?: number,
  glowColor?: string,
  onChange?: number => any,
  haptic?: () => void,
  disabled?: boolean,
  showKnob?: boolean,

  blockParentScroll: () => {},
  unblockParentScroll: () => {}
};

type StateType = {
  dragging: boolean,
  lastValue: number,
  currentValue: number,
};

export default class MagicSlider extends React.Component<PropsType, StateType> {
  static defaultProps = {
    glowColor: '#ffffff',
    offColor: '#999999',
    opacity: 1,
    isOn: false,
    text: "",
    textColor: '#000000',
    onChange: (n: number) => null,
    haptic: () => {},
    extraStyle: {},
    increment: 1,
    disabled: false,
    showKnob: true,

    blockParentScroll: () => {},
    unblockParentScroll: () => {},
  };

  state: StateType = {
    dragging: false,
    currentValue: 0,
    lastValue: 0,
  };

  _sizes = {
    barHeight: 0,
    buttonWidth: 0,
    sliderMargin: 0,
    sliderWidth: 0,
    valueWidth: 0,
    knobSize: 0,
  };

  /* touch responder */
  _panResponder: Object;

  /* component x-axis and y-axis position relative to screen */
  _x_pos: number;
  _measured: boolean = false;

  /* reference to container object used to obtain component position */
  _container_ref: Object;

  componentWillMount() {
    const { unblockParentScroll } = this.props;

    /* create touch responder */
    this._panResponder = PanResponder.create({
      onStartShouldSetPanResponder: (evt, gestureState) => true,
      onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => true,
      onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,
      onPanResponderTerminationRequest: (evt, gestureState) => true,

      onPanResponderGrant: this.onPanResponderGrant.bind(this),
      onPanResponderMove: this.onPanResponderMove.bind(this),
      onPanResponderRelease: this.onPanResponderRelease.bind(this),

      onPanResponderStart: this.onPanResponderStart.bind(this),
      onPanResponderEnd: unblockParentScroll,
      onPanResponderTerminate: unblockParentScroll
    });
  }

  onPanResponderStart(evt: Object, gestureState: Object) {
    const { haptic, disabled, blockParentScroll } = this.props;

    if (!disabled) {
      blockParentScroll();
      haptic();
    }
  }

  onPanResponderGrant(evt: Object, gestureState: Object) {
    this.measure(() => this.onKnobMove(gestureState.x0));
  }

  onPanResponderMove(evt: Object, gestureState: Object) {
    if (this._measured) {
      this.onKnobMove(gestureState.moveX);
    }
  }

  onPanResponderRelease() {
    this._measured = false;

    this.setState({
      dragging: false,
    });
  }

  onKnobMove(x: number) {
    const { lastValue } = this.state;
    const { maxValue, onChange } = this.props;

    var cur_pos = maxValue * (x - this._x_pos - this._sizes.sliderMargin/2) / this._sizes.sliderWidth;
    cur_pos = Math.min(Math.max(cur_pos, 0), maxValue);
    var cur_value = parseInt(cur_pos);

    if (cur_value !== lastValue && onChange)
      onChange(cur_value);

    this.setState({
      dragging: true,
      lastValue: cur_value,
      currentValue: cur_pos
    });
  }

  measure(callback?: () => void = () => {}) {
    this._container_ref.measure((x, y, width, height, pageX, pageY) => {
      this._x_pos = pageX;
      callback();
      this._measured = true;
    });
  }

  render() {
      const { width, height, value, maxValue, glowColor, onChange, showKnob } = this.props;
      const { dragging, currentValue } = this.state;

      var v = dragging ? currentValue : value;
      this._sizes.barHeight = Math.min(height, width / 5);
      this._sizes.buttonWidth = this._sizes.barHeight / 2;
      this._sizes.sliderMargin = this._sizes.barHeight;
      this._sizes.sliderWidth = width - this._sizes.sliderMargin;
      this._sizes.valueWidth = (v/maxValue) * this._sizes.sliderWidth; // width of the highlighted bar
      this._sizes.knobSize = this._sizes.barHeight*0.75;
      var sliderGlow = this._sizes.valueWidth === 0 ? {} : {
        shadowColor: glowColor,
        shadowRadius: 16,
        shadowOffset: {width: 0, height: 0},
        shadowOpacity: 1,
        backgroundColor: glowColor,
      };

      var knobStyle = {
        ...styles.knob,
        width: this._sizes.knobSize,
        height: this._sizes.knobSize,
        left: this._sizes.valueWidth-this._sizes.knobSize/2,
      };
      if (dragging)
        knobStyle.backgroundColor = '#ffffff';

      var knob = showKnob? <View style={knobStyle} /> : null;

      var sliderInnerContainerStyle = {...styles.sliderInnerContainer};

      return (
        <View
          {...this._panResponder.panHandlers}
          ref={(c) => this._container_ref = c}
          onLayout={() => null}
          style={[styles.container, {width, height}]}>

          <View style={{...styles.sliderContainer, width: this._sizes.sliderWidth, height: this._sizes.barHeight, marginLeft: this._sizes.sliderMargin/2, marginRight: this._sizes.sliderMargin/2}}>
          <View style={{...sliderInnerContainerStyle, width: this._sizes.valueWidth, ...sliderGlow}} />
          <View style={{...sliderInnerContainerStyle, width: this._sizes.sliderWidth-this._sizes.valueWidth}} />
          {knob}
        </View>
      </View>
    );
  }
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'row',
  },
  signs: {
    fontWeight: 'lighter',
    color: '#aaaaaa',
    textAlign: 'center',
  },
  sliderContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    display: 'flex',
    flexDirection: 'row',
  },
  sliderInnerContainer: {
    height: 2,
    backgroundColor: '#999999',
  },
  knob: {
    position: 'absolute',
    borderRadius: 10000,
    backgroundColor: '#999999',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
};
