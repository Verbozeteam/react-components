/* @flow */

import * as React from 'react';
import { View, Animated, Text, PanResponder, StyleSheet } from 'react-native';

import LinearGradient from 'react-native-linear-gradient';

import type { LayoutType, StyleType } from './flowtypes';

type PropTypes = {
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
  orientation?: 'vertical' | 'horizontal',
  layout?: LayoutType,
  sliderGradient?: [string, string],
  backgroundColor?: string,
  sliderMargin?: number,

  // TODO: for the futrue
  nightMode?: boolean
};

type StateType = {
  touch: boolean,
  touch_value: number,
  touch_start_value: number
};

class GenericSlider extends React.Component<PropTypes, StateType> {
  static defaultProps = {
    orientation: 'horizontal',
    value: 50,
    maximum: 100,
    minimum: 0,
    round: (value) => Math.round(value),
    onStart: () => null,
    onMove: () => null,
    onRelease: () => null,
    sliderGradient: ['#36DBFD', '#178BFB'],
    highlightGradient: ['#41FFFF', '#1CA7FF'],
    backgroundColor: '#181B31',
    sliderMargin: 5,
    nightMode: true,
  };

  state = {
    touch: false,
    touch_value: 0,
    touch_start_value: 0
  };

  /* default height and width for slider if non provided through props */
  _default_height: number = 70;
  _default_width: number = 250;

  /* animated value and old value used for animation speed calculation */
  _animated_value: Object;
  _old_value: number = 0;

  _container_layout: LayoutType | StyleType;
  _slider_mask: LayoutType | StyleType;
  _slider_layout: StyleType;
  _ratio: number;

  /* touch responder */
  _panResponder: Object;

  componentWillMount() {
    const { value } = this.props;

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

    this.calculateLayout();
    this.calculateSliderRatio();
    this.calculateAnimatedValue(true);
  }

  _onPanResponderGrant() {
    const { value, onStart } = this.props;

    this.setState({
      touch: true,
      touch_value: value,
      touch_start_value: value
    });

    /* call provided onStart handler */
    onStart();
  }

  _onPanResponderMove(evt: Object, gestureState: {dx: number, dy: number}) {
    const { orientation, maximum, minimum, round, onMove } = this.props;
    const { touch_value, touch_start_value } = this.state;

    /* calculate gesture distance and limit value to remain within range */
    var new_value: number;
    if (orientation === 'horizontal') {
      new_value = touch_start_value + (gestureState.dx / this._ratio);
    }
    else {
      new_value = touch_start_value - (gestureState.dy / this._ratio);
    }
    var rounded_new_value: number = round(new_value);

    /* keep value within set bounds */
    if (new_value > maximum) {
      rounded_new_value = maximum;
    }

    else if (new_value < minimum) {
      rounded_new_value = minimum;
    }

    this.setState({
      touch_value: rounded_new_value
    });

    /* if rounded value has changed, call provided onMove handler */
    if (rounded_new_value !== round(touch_value)) {
      onMove(rounded_new_value);
    }
  }

  _onPanResponderRelease() {
    const { round, onRelease } = this.props;
    const { touch_value } = this.state;

    this.setState({
      touch: false
    });

    this._old_value = touch_value;

    /* call provided onRelease handler */
    onRelease(round(touch_value));
  }

  calculateLayout() {
    const { orientation, sliderMargin } = this.props;
    var { layout } = this.props;

    /* layout has not been passed through props, fallback to default */
    if (!layout) {
      layout = {
        height: (orientation === 'horizontal') ?
          this._default_height : this._default_width,
        width: (orientation === 'horizontal') ?
          this._default_width : this._default_height
      };
    }

    /* calculate the layout of the slider container */
    this._container_layout = {
      height: layout.height,
      width: layout.width,
      borderRadius: layout.width / 2
    };

    /* calculate the layout of the slider mask */
    this._slider_mask = {
      height: layout.height - sliderMargin * 2,
      width: layout.width - sliderMargin * 2,
      top: sliderMargin,
      left: sliderMargin,
      borderRadius: (layout.width - sliderMargin * 2) / 2
    };

    /* calculate the border radii of the slider itself depending on
       orientation */
    if (orientation === 'horizontal') {
      this._slider_layout = {
        borderTopRightRadius: this._slider_mask.borderRadius,
        borderBottomRightRadius: this._slider_mask.borderRadius,
      }
    }
    else {
      this._slider_layout = {
        borderTopRightRadius: this._slider_mask.borderRadius,
        borderTopLeftRadius: this._slider_mask.borderRadius,
      };
    }
  }

  calculateSliderRatio() {
    const { orientation, maximum, minimum, round, sliderMargin } = this.props;

    if (orientation === 'horizontal') {
      this._ratio = (this._container_layout.width - sliderMargin * 2) /
        (maximum - minimum);
    }
    else {
      this._ratio = (this._container_layout.height - sliderMargin * 2) /
        (maximum - minimum);
    }
  }

  getSliderPosition(value) {
    const { minimum } = this.props;
    return (value - minimum) * this._ratio;
  }

  calculateAnimatedValue(initial?: boolean) {
    const { maximum, minimum, value } = this.props;

    const position = this.getSliderPosition(value);

    if (initial) {
      this._animated_value = new Animated.Value(position);
    }

    else {
      this._animated_value.stopAnimation();
      Animated.timing(this._animated_value, {
        toValue: position,
        duration: Math.abs(450 / (maximum - minimum) * (value - this._old_value))
      }).start();
    }
  }

  _measure(callback) {
    this._container_ref.measure((x, y, width, height, pageX, pageY) => {
      this._x_pos = pageX;
      this._y_pos = pageY;

      if (typeof callback == 'function') {
        callback();
      }
    });
  }

  componentWillReceiveProps() {
    const { value } = this.props;
    this._old_value = value;
  }

  render() {
    const { orientation, highlightGradient, backgroundColor, round, minimum }
      = this.props;
    var { value, sliderGradient } = this.props;
    const { touch, touch_value } = this.state;

    /* recalculate layout and ratio */
    this.calculateLayout();
    this.calculateSliderRatio();

    var position: number;
    if (touch) {
      position = this.getSliderPosition(touch_value);
      sliderGradient = highlightGradient;
    } else {
      // position = this.getSliderPosition(touch_value);
      // sliderGradient = highlightGradient;
      this.calculateAnimatedValue();
      position = this._animated_value;
    }

    const slider_size: LayoutType = {};
    if (orientation ==='horizontal') {
      slider_size.width = position;
    }

    else {
      slider_size.height = position;
    }

    return (
      <View {...this._panResponder.panHandlers}
        style={[this._container_layout, {backgroundColor}]}>
        <Animated.View style={[styles.slider_mask, this._slider_mask, slider_size]}>
          <LinearGradient colors={sliderGradient}
            start={{x: 1, y: 0}} end={{x: 0, y: 1}}
            style={[styles.slider, this._slider_layout]}>
          </LinearGradient>
        </Animated.View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  slider_mask: {
    position: 'absolute',
    overflow: 'hidden',
  },
  slider: {
    position: 'absolute',
    height: '100%',
    width: '100%',
    bottom: 0,
    overflow: 'hidden'
  }
});

module.exports = GenericSlider;
