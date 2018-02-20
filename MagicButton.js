/* @flow */

import * as React from 'react';
import PropTypes from 'prop-types';
import { View, Text, StyleSheet, TouchableWithoutFeedback } from 'react-native';

type PropsType = {
    width: number,
    height: number,
    glowColor?: string,
    offColor?: string,
    isOn?: boolean,
    text?: string,
    textColor?: string,
    onPress?: () => any,
    onPressIn?: () => any,
    onPressOut?: () => any,
    extraStyle?: Object,
    sideText?: string,
    sideTextStyle?: Object,
    icon?: string,
};

type StateType = {
    hover: boolean,
};

export default class MagicButton extends React.Component<PropsType, StateType> {
    static defaultProps = {
        glowColor: '#ffffff',
        offColor: '#999999',
        opacity: 1,
        isOn: false,
        text: "",
        textColor: '#000000',
        onPress: () => null,
        onPressIn: () => null,
        onPressOut: () => null,
        extraStyle: {},
        sideTextStyle: {},
    };

    state: StateType = {
        hover: false,
    };

    onPressIn() {
        const { onPressIn } = this.props;
        this.setState({hover: true});
        if (onPressIn)
            onPressIn();
    }

    onPressOut() {
        const { onPressOut } = this.props;
        this.setState({hover: false});
        if (onPressOut)
            onPressOut();
    }

    render() {
        const {
            width,
            height,
            glowColor,
            offColor,
            isOn,
            text,
            textColor,
            onPress,
            extraStyle,
            sideText,
            sideTextStyle,
            icon,
        } = this.props;
        const { hover } = this.state;

        var containerStyle = {
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'row',
        };

        var style = {
            borderRadius: 100000,
            alignItems: 'center',
            justifyContent: 'center',
            width,
            height,
        };

        var textStyle = {
            fontWeight: '100',
            textAlign: 'center',
            fontSize: height / 3,
            color: textColor,
        };

        if (isOn || hover) {
            style = {...style, ...{
                shadowColor: glowColor,
                shadowRadius: 5,
                shadowOffset: {width: 0, height: 0},
                shadowOpacity: 1,
                backgroundColor: glowColor,
            }};
        } else {
            style = {...style, ...{
                borderWidth: 2,
                borderColor: offColor,
            }};
        }

        // if (icon) {
        //     style.background = 'url(' + icon + ')';
        //     style.backgroundSize = Math.max(width/2, height/2);
        //     style.backgroundPosition = 'center';
        //     style.backgroundRepeat = 'no-repeat';
        // }

        var sideTextView = null;
        if (sideText) {
            sideTextView = <Text style={[textStyle, {marginLeft: width/5}, sideTextStyle]}>{sideText}</Text>
        }

        return (
            <TouchableWithoutFeedback
                     onPress={onPress}
                     onPressIn={this.onPressIn.bind(this)}
                     onPressOut={this.onPressOut.bind(this)}>
                <View style={[containerStyle, extraStyle]}>
                    <View style={style}>
                        <Text style={textStyle}>{text}</Text>
                    </View>
                    {sideTextView}
                </View>
            </TouchableWithoutFeedback>
        );
    }
};
