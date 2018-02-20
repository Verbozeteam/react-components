/* @flow */

import React, { Component } from 'react';
import { View, Text, Image, StyleSheet, PanResponder } from 'react-native';

import { Colors } from '../constants/styles';

import GenericSlider from './GenericSlider';

import type { LayoutType, StyleType } from './flowtypes';

type PropsType = {
  width?: number,
  height?: number,
  value?: number,
  maxValue?: number,
  increment?: number,
  glowColor?: string,
  onChange?: number => null,
  disabled?: number,

  maximum?: number,
  minimum?: number,

  round?: (value: number) => string,
  textGenerator?: (value: number) => string,
  onStart?: () => null,

  /* onMove doesn't necessarily need to update value passed through props -
   slider live updates on it's own */
  onMove?: (value: number) => null,

  /* onRelease must pass updated value through props or else slider will pop
   back to original value */
  onRelease?: (value: number) => null,

  showValue?: boolean,
  sliderMargin?: number,
  icon?: number,
  fontColor?: string,
  backgroundColor?: string,
  iconBackgroundColor?: string,


};

type StateType = {
  touch: boolean,
  touchValue: number,
  touchStartValue: number
};

export default class MagicSlider extends Component<PropsType, StateType> {

  static defaultProps = {
    width: 160,
    height: 40,

    value: 50,
    maxValue: 100,
    glowColor: Colors.red_shadow,
    increment: 10,
    round: () => null,
    onStart: () => null,
    onChange: () => null,
    onMove: () => null,
    onRelease: () => null,
    sliderMargin: 2,

    backgroundColor: '#181B31',
  };

  state = {
    touch: false,
    touchValue: 0,
    touchStartValue: 0
  };



  _ratio: number;
  _containerLayout: LayoutType | StyleType;
  _iconContainerLayout: LayoutType | StyleType;
  _iconLayout: LayoutType;
  _sliderMask: LayoutType | StyleType;
  _sliderLayout: StyleType;

  /* touch responder */
  _panResponder: Object;

  _onPanResponderGrant() {
    const { value, onStart } = this.props;

    this.setState({
      touch: true,
      touchValue: value,
      touchStartValue: value
    });

    /* call provided onStart handler */
    onStart();
  }

  _onPanResponderMove(evt: Object, gestureState: {dx: number, dy: number}) {
    const { maximum, minimum, round, onMove } = this.props;
    const { touchValue, touchStartValue } = this.state;

    /* calculate gesture distance and limit value to remain within range */
    var newValue: number = touchStartValue + (gestureState.dx / this._ratio);

    var roundedNewValue: number = round(newValue);

    /* keep value within set bounds */
    if (newValue > maximum) {
      newValue = maximum;
    }
    else if (newValue < minimum) {
      newValue = minimum;
    }

    this.setState({
      touchValue: roundedNewValue
    });

    /* if rounded value has changed, call the provided onMove handler */
    if (roundedNewValue !== round(touchValue)) {
      onMove(roundedNewValue);
    }
  }

  _onPanResponderRelease() {
    const { round, onRelease } = this.props;
    const { touchValue } = this.state;

    this.setState({
      touch: false
    });

    /* call provided onRelease handler */
    onRelease(round(touchValue));

  }

  componentWillMount() {
    /* create touch responder */
    this._panResponder = PanResponder.create({
      onStartShouldSetPanResponder: (evt, gestureState) => true,
      onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => true,
      onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,

      onPanResponderGrant: () => this._onPanResponderGrant(),
      onPanResponderMove: (evt, gestureState) => this._onPanResponderMove(evt, gestureState),
      onPanResponderRelease: (evt, gestureState) => this._onPanResponderRelease(),
    });
  }

  calculateLayout() {
    const { sliderMargin, height, width, icon } = this.props;

    /* calculate the layout of the slider container */
    this._containerLayout = {
      height: height,
      width: width,
      borderRadius: 5,
    };

    /* calculate icon layout */
    if (icon) {
      this._containerLayout.marginLeft = height / 2 * -1;
      this._containerLayout.width -= height;
    }

    this._iconContainerLayout = {
      height: height,
      width: height * 3 / 2,
      borderTopLeftRadius: 5,
      borderBottomLeftRadius: 5,
    };

    this._iconLayout = {
      height: height * 3 / 4,
      width: height * 3 / 4,
      marginRight: height / 2
    };

    /* calculate the layout of the slider mask */
    this._sliderMask = {
      height: this._containerLayout.height - sliderMargin * 2,
      width: this._containerLayout.width - sliderMargin * 2,
      top: sliderMargin,
      left: sliderMargin,
      borderRadius: 5,//(this._containerLayout.width - sliderMargin * 2) / 2
    };

    /* calculate the border radii of the slider itself */
    this._sliderLayout = {
      borderTopRightRadius: this._sliderMask.borderRadius,
      borderBottomRightRadius: this._sliderMask.borderRadius,
    }
  }

  calculateSilderRatio() {
    const { maximum, minimum, round, sliderMargin } = this.props;

    this._ratio = (this._containerLayout.width - sliderMargin * 2) / (maximum - minimum);
  }

  render() {
    const { minimum, round, textGenerator, fontColor, backgroundColor,
      showValue, icon, iconBackgroundColor } = this.props;
    const { touch, touchValue } = this.state;

    var { value } = this.props;

    /* recalculate layout and ratio */
    this.calculateLayout();
    this.calculateSilderRatio();

    /* if touches began, override provided value */
    if (touch) {
      value = touchValue;
      // sliderGradient = highlightGradient;
    }

    /* calculate the size of slider */
    const sliderSize: LayoutType = {};

    const width = (value - minimum) * this._ratio - 1;
    if (width < this._sliderMask.height) {
      sliderSize.width = this._sliderMask.height;
      sliderSize.left = width - this._sliderMask.height;
    } else {
      sliderSize.width = width;
    }

    var valueText = null;
    if (showValue) {
      valueText = <View style={styles.valueContainer}>
        <Text style={[styles.valueText, {color: fontColor}]}>
          {textGenerator(round(value))}
        </Text>
      </View>
    }

    return (

      <View {...this._panResponder.panHandlers}
        style={ styles.container }>

        {(icon) ? <View style={ [this._iconContainerLayout,
          styles.iconContainer, { backgroundColor: iconBackgroundColor }] }>
            <Image style={ this._iconLayout } source={ icon } />
          </View> : null}

          <View style={ [this._containerLayout, { backgroundColor }] }>
            <View style={ [styles.sliderMask, this._sliderMask] }>
              { valueText }
            </View>
          </View>

      </View>

      // <GenericSlider />


    );
  }
}

const styles = {
  container: {
    flexDirection: 'row',
  },
  valueContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center'
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  sliderMask: {
    position: 'absolute',
    overflow: 'hidden',
  },
  valueText: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0)'
  },
};
