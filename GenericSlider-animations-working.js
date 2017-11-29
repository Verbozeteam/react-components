/* @flow */

import * as React from 'react';
import { View, Animated, Image, Text, PanResponder, StyleSheet }
  from 'react-native';

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
  icon?: number, /* this must be result of require(<image>) */
  layout?: LayoutType,
  sliderGradient?: [string, string],
  backgroundColor?: string,
  iconBackgroundColor?: string,
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
    iconBackgroundColor: '#0C0F26',
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
  _animated_size: Object;
  _animated_offset: Object;
  _animation_duration: number = 450;
  _old_value: number = 0;

  _container_layout: LayoutType | StyleType;
  _slider_layout: StyleType;
  _ratio: number;
  _icon_container_layout: LayoutType | StyleType;
  _icon_layout: LayoutType;

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
    this.calculateAnimatedValues(true);
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
    const { orientation, sliderMargin, icon } = this.props;
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

    /* calculate icon layout */
    if (icon) {
      this._container_layout.marginLeft = layout.height / 2 * -1;
      this._container_layout.width -= layout.height;

      this._icon_container_layout = {
        height: layout.height,
        width: layout.height * 3 / 2,
        borderTopLeftRadius: layout.height / 2,
        borderBottomLeftRadius: layout.height / 2
      };

      this._icon_layout = {
        height: layout.height * 3 / 4,
        width: layout.height * 3 / 4,
        marginRight: layout.height / 2
      };
    }

    /* calculate the layout of the slider mask */
    this._slider_mask = {
      height: this._container_layout.height - sliderMargin * 2,
      width: this._container_layout.width - sliderMargin * 2,
      top: sliderMargin,
      left: sliderMargin,
      borderRadius: (this._container_layout.width - sliderMargin * 2) / 2
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

  calculateAnimatedValues(initial?: boolean) {
    const { maximum, minimum, value } = this.props;

    console.log('calculateAnimatedValues');

    if (this._old_value == value) {
      return;
    }

    var size: number = this.getSliderSize(value);
    var offset: number = 0;

    var { size, offset } = this.getSliderSizeWithOffset(size);

    if (initial) {
      this._animated_size = new Animated.Value(size);
      this._animated_offset = new Animated.Value(offset);
    }

    else {
      if (this._animated_size) {
        this._animated_size.stopAnimation();
      }

      if (this._animated_offset) {
        this._animated_offset.stopAnimation();
      }

      const size_animation = Animated.timing(this._animated_size, {
        toValue: size,
        duration: this._animation_duration
      }).start();

      const offset_animation = Animated.timing(this._animated_offset, {
        toValue: offset,
        duration: 5000
      }).start();

      console.log(this._animated_size, this._animated_offset);

      // size_animation.start();
      // offset_animation.start();

      // Animated.sequence([offset, size_animation]).start();
    }
  }

  getSliderSize(value): number {
    const { minimum } = this.props;

    return (value - minimum) * this._ratio;
  }

  getSliderSizeWithOffset(size): {size: number, offset: number} {
    const { orientation } = this.props;

    var offset: number = 0;
    if (orientation === 'horizontal' && size < this._slider_mask.height) {
      offset = size - this._slider_mask.height;
      size = this._slider_mask.height;
    }

    else if (size > this._slider_layout.width) {
      offset = size - this._slider_mask.width;
      size = this._slider_mask.width;
    }

    return { size, offset };
  }

  getSliderLayout() {
    const { orientation } = this.props;
    const { touch, touch_value } = this.state;

    var slider_layout: LayoutType = {};
    if (touch) {
      var size = this.getSliderSize(touch_value);
      const { size, offset } = this.getSliderSizeWithOffset(size);
      if (orientation === 'horizontal') {
        slider_layout.width = size;
        slider_layout.left = offset;
      }

      else {
        slider_layout.height = size;
        slider_layout.bottom = offset;
      }
    }

    else {
      if (orientation === 'horizontal') {
        slider_layout.width = this._animated_size;
        slider_layout.left = this._animated_offset;
      }

      else {
        slider_layout.height = this._animated_size;
        slider_layout.bottom = this._animated_offset;
      }
    }

    return slider_layout;
  }

  componentDidUpdate(prevProps: PropTypes) {
    const { touch } = this.state;

    this._old_value = prevProps.value;
    this.calculateAnimatedValues();
  }

  render() {
    const { orientation, highlightGradient, backgroundColor, round, minimum,
      icon, iconBackgroundColor } = this.props;
    var { sliderGradient } = this.props;
    const { touch } = this.state;

    /* recalculate layout and ratio */
    this.calculateLayout();
    this.calculateSliderRatio();

    if (touch) {
      sliderGradient = highlightGradient;
    }

    const slider_layout: LayoutType = this.getSliderLayout();

    return (
      <View style={styles.container}>
        {(icon) ? <View style={[this._icon_container_layout,
          styles.icon_container, {backgroundColor: iconBackgroundColor}]}>
          <Image style={this._icon_layout} source={icon} />
        </View> : null}
        <View {...this._panResponder.panHandlers}
          style={[this._container_layout, {backgroundColor}]}>
          <View style={[styles.slider_mask, this._slider_mask]}>
            <Animated.View style={slider_layout}>
              <LinearGradient colors={sliderGradient}
                start={{x: 1, y: 0}} end={{x: 0, y: 1}}
                style={[styles.slider, this._slider_layout]}>
              </LinearGradient>
            </Animated.View>
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row'
  },
  icon_container: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  slider_mask: {
    position: 'absolute',
    overflow: 'hidden',
  },
  slider: {
    height: '100%',
    width: '100%',
    overflow: 'hidden'
  }
});

module.exports = GenericSlider;
