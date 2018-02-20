/* @flow */

import React, { Component } from 'react';
import { View, Text, Image, StyleSheet, TouchableWithoutFeedback }
  from 'react-native';

type PropsType = {
  width?: number,
  height?: number,

  glowColor?: string,
  offColor?: string,

  isOn?: boolean,

  text?: string,
  textColor?: string,
  textStyle?: string,

  onPress?: () => any,
  onPressIn?: () => any,
  onPressOut?: () => any,

  extraStyle?: Object,

  sideText?: string,
  sideTextStyle?: Object,

  icon?: number,
  showBorder?: boolean
};

type StateType = {
  hover: boolean
};

export default class MagicButton extends Component<PropsType, StateType> {

  static defaultProps = {
    width: 45,
    height: 45,

    glowColor: '#FFFFFF',
    offColor: '#707070',

    isOn: false,

    textColor: '#000000',
    textStyle: {},

    onPress: () => null,
    onPressIn: () => null,
    onPressOut: () => null,

    extraStyle: {},

    sideTextStyle: {},

    showBorder: true
  };

  state = {
    hover: false
  };

  onPressIn() {
    const { onPressIn } = this.props;

    this.setState({
      hover: true
    });

    onPressIn();
  }

  onPressOut() {
    const { onPressOut } = this.props;

    this.setState({
        hover: false
    });

    onPressOut();
  }

  render() {
    const { width, height, glowColor, offColor, isOn, text, textColor, textStyle,
      onPress, extraStyle, sideText, sideTextStyle, icon,
      showBorder } = this.props;
    const { hover } = this.state;

    const container_style = {
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      ...extraStyle
    };

    var button_style = {
      borderRadius: height / 2,
      alignItems: 'center',
      justifyContent: 'center',
      height,
      width
    };

    if (isOn || hover) {
      button_style = {...button_style, ...{
        shadowColor: glowColor,
        shadowRadius: 5,
        shadowOffset: {width: 0, height: 0},
        shadowOpacity: 1,
        backgroundColor: glowColor
      }};
    } else if (showBorder) {
      button_style = {...button_style, ... {
        borderWidth: 2,
        borderColor: offColor
      }};
    }

    var button_inner = null;
    if (text) {
      var button_text_style = {
        fontWeight: '100',
        textAlign: 'center',
        fontSize: height / 3,
        color: textColor,
        ...textStyle
      };

      button_inner = <Text style={button_text_style}>{text}</Text>;
    }

    else if (icon) {
      button_inner = <Image source={icon} />;
    }

    var side_text = null;
    if (sideText) {
      side_text = (
        <Text style={[sideTextStyle, {marginLeft: width / 5}]}>
          {sideText}
        </Text>
      );
    }

    return (
      <TouchableWithoutFeedback onPress={onPress}
        onPressIn={this.onPressIn.bind(this)}
        onPressOut={this.onPressOut.bind(this)}>

        <View style={container_style}>
          <View style={button_style}>
            {button_inner}
          </View>
          {side_text}
        </View>
      </TouchableWithoutFeedback>
    );
  }
}
