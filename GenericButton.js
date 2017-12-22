/* @flow */

import * as React from 'react';
import { View, Image, StyleSheet } from 'react-native';

import LinearGradient from 'react-native-linear-gradient';

import type { LayoutType, StyleType } from './flowtypes';

type PropTypes = {
  icon?: number, /* this must be result of require(<image>) */
  action?: () => null,
  pressIn?: () => null,
  pressOut?: () => null,
  disabled?: boolean,


  /* override styling */
  layout?: LayoutType,
  style?: StyleType,
  buttonGradient?: [string, string],
  backgroundColor?: string,
  highLightGradient?: [string, string],
  disabledGradient?: [string, string],
  buttonMargin?: string,
  borderRadius?: number, /* number between 0 - 1 */
};

type StateType = {
  pressed: boolean
};

class GenericButton extends React.Component<PropTypes, StateType> {

  static defaultProps = {
    action: () => null,
    pressIn: () => null,
    pressOut: () => null,
    disabled: false,

    layout: {
      height: 80,
      width: 80,
    },
    style: {},
    buttonGradient: ['#2285d1', '#152747'],
    backgroundColor: '#181B31',
    highLightGradient: ['#32a5e2', '#253757'],
    disabledGradient: ['#AFAFAF', '#8A8A8A'],
    buttonMargin: 2,
    borderRadius: 1,
  };

  state = {
    pressed: false
  };

  /* calculated layout */
  _container_layout: LayoutType;
  _button_layout: LayoutType;

  componentWillMount() {
    this.calculateLayout();
  }

  calculateLayout() {
    const { layout, buttonMargin, borderRadius } = this.props;

    this._container_layout = {
      height: layout.height,
      width: layout.width,
      borderRadius: (layout.height / 2) * borderRadius
    };

    this._button_layout = {
      height: layout.height - buttonMargin * 2,
      width: layout.width - buttonMargin * 2,
      top: buttonMargin,
      left: buttonMargin,
      borderRadius: (layout.height - (buttonMargin * 2)) / 2 * borderRadius
    };
  }

  _onTouchStart() {
    const { disabled, action, pressIn } = this.props;

    if (!disabled) {
      if (pressIn)
        pressIn();
      if (action)
        action();

      this.setState({
        pressed: true
      });
    }
  }

  _onTouchEnd() {
    const { disabled, pressOut } = this.props;
    if (!disabled) {
      if (pressOut)
        pressOut();
    }

    this.setState({
      pressed: false
    });
  }

  render() {
    const { layout, backgroundColor, highLightGradient, disabledGradient,
      style, buttonMargin, disabled, icon, text } = this.props;
    var { buttonGradient } = this.props;
    const { pressed } = this.state;

    if (pressed) {
      buttonGradient = highLightGradient;
    }

    if (disabled) {
      buttonGradient = disabledGradient;
    }

    return (
      <View style={[this._container_layout, {backgroundColor}, style]}
        onTouchStart={this._onTouchStart.bind(this)}
        onTouchEnd={this._onTouchEnd.bind(this)}>
        <LinearGradient colors={buttonGradient}
          start={{x: 1, y: 0}} end={{x: 0, y: 1}}
          style={[styles.button, this._button_layout]}>
        {(icon) ? <Image source={icon} /> : null}
        </LinearGradient>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center'
  }
})

module.exports = GenericButton;
