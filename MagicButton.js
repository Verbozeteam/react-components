/* @flow */

import React, { Component } from 'react';
import { View, Text, StyleSheet, TouchableWithoutFeedback } from 'react-native';

import { Colors } from '../constants/styles';

type PropsType = {
  width: number,
  height: number,
  glowColor?: number,
  onColor?: number,
  offColor?: number,
  isOn?: boolean,
  text?: string,
  textColor?: string,
  onPress?: () => null,
  onPressIn?: () => null,
  onPressOut?: () => null,
  extraStyle?: () => null,
  sideText?: string,
  sideTextStyle?: Object,
  icon?: string
};

type StateType = {};

export default class MagicButton extends Component<PropsType, StateType> {
  static defaultProps = {
    glowColor: '#FFFFFF',
    offColor: '#999999',
    isOn: false,
    text: "",
    textColor: '#000000',
    onPress: () => null,
    onPressIn: () => null,
    onPressOut: () => null,
    extraStyle: {},
    sideTextStyle: {},
  };

  render() {
    const {
      width,
      height,
      glowColor,
      onColor,
      offColor,
      isOn,
      text,
      textColor,
      onPress,
      onPressIn,
      onPressOut,
      extraStyle,
      sideText,
      sideTextStyle,
      icon
    } = this.props;


    const styles = {

      baseStyle: {
        flexDirection: 'row'
      },
      viewStyle: {
        width: width,
        height: height,
        borderRadius: height / 2,
        justifyContent: 'center',
        alignSelf: 'flex-start'
      },
      textStyle: {
        textAlign: 'center',
        color: textColor,
        lineHeight: height,
      }
    };

    if (isOn) {
      styles.viewStyle.backgroundColor = onColor;
      styles.viewStyle.shadowColor = glowColor;
      styles.viewStyle.shadowRadius = 10;
      styles.viewStyle.shadowOpacity = 1;
    }
    else {
      styles.viewStyle.borderWidth = 2;
      styles.viewStyle.borderStyle = 'solid';
      styles.viewStyle.borderColor = offColor;
    }

    return (

        <View style={ styles.baseStyle }>
          <TouchableWithoutFeedback
            onPress={ () => onPress() }
            onPressIn={ () => onPressIn() }
            onPressOut={ () => onPressOut() }
            >
            <View style={{ flexDirection: 'row' }}>
              <View style={ styles.viewStyle }>
                <Text style={ styles.textStyle }>
                  {text}
                </Text>
              </View>
              <Text style={ sideTextStyle }>
                {sideText}
              </Text>
            </View>
          </TouchableWithoutFeedback>
        </View>
    );
  }
}

