/* @flow */

import * as React from 'react';
import { View, Text, PanResponder, StyleSheet } from 'react-native';

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
  fontColor?: string,
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
    fontColor: '#FFFFFF',
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

  _container_layout: LayoutType | StyleType;
  _slider_mask: LayoutType | StyleType;
  _slider_layout: StyleType;
  _ratio: number;

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
      }
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

  render() {
    const { orientation, minimum, round, fontColor, highlightGradient,
      backgroundColor } = this.props;
    var { value, sliderGradient } = this.props;
    const { touch, touch_value } = this.state;

    /* recalculate layout and ratio */
    this.calculateLayout();
    this.calculateSliderRatio();

    /* if touches began, override provided value */
    if (touch) {
      value = touch_value;
      sliderGradient = highlightGradient;
    }

    /* calculate the size of slider */
    const slider_size: LayoutType = {};
    if (orientation === 'horizontal') {
      const width = (value - minimum) * this._ratio;
      if (width < this._slider_mask.height) {
        slider_size.width = this._slider_mask.height;
        slider_size.left = width - this._slider_mask.height;
      } else {
        slider_size.width = width;
      }
    }

    else {
      const height = (value - minimum) * this._ratio;
      if (height < this._slider_mask.width) {
        slider_size.height = this._slider_mask.width;
        slider_size.bottom = height - this._slider_mask.width;
      } else {
        slider_size.height = height;
      }
    }

    return (
      <View {...this._panResponder.panHandlers}
        style={[this._container_layout, {backgroundColor}]}>
        <View style={[styles.slider_mask, this._slider_mask]}>
          <LinearGradient colors={sliderGradient}
            start={{x: 1, y: 0}} end={{x: 0, y: 1}}
            style={[styles.slider, this._slider_layout, slider_size]}>
          </LinearGradient>

          <View style={styles.value_container}>
            <Text style={[styles.value_text, {color: fontColor}]}>
              {round(value)}
            </Text>
          </View>
        </View>
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
  },
  value_container: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center'
  },
  value_text: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0)'
  }
});

module.exports = GenericSlider;
