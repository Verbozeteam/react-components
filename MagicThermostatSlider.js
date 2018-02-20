/* @flow */

import * as React from 'react';
import PropTypes from 'prop-types';
import { View, Text, StyleSheet, PanResponder } from 'react-native';
import Svg, { Line, Polygon } from 'react-native-svg';

type PropsType = {
    width: number,
    height: number,
    value: number,
    enabled?: boolean,
    onChange?: number => any,
};

type StateType = {
    dragging: boolean,
    lastValue: number,
    currentValue: number,
};

export default class MagicThermostatSlider extends React.Component<PropsType, StateType> {
    static defaultProps = {
        enabled: true,
        onChange: (n: number) => null,
    };

    state: StateType = {
        dragging: false,
        currentValue: 0,
        lastValue: 0,
    };

    _numDashes: number = 35;
    _minimum: number = 16;
    _maximum: number = 32;
    _hotColor: {r: number, g: number, b: number} = {r: 0xBA, g: 0x37, b: 0x37}; // #BA3737
    _coldColor: {r: number, g: number, b: number} = {r: 43, g: 159, b: 255};

    /* touch responder */
    _panResponder: Object;

    /* component x-axis and y-axis position relative to screen */
    _x_pos: number;
    _y_pos: number;

    /* reference to container object used to obtain component position */
    _container_ref: Object;

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

    _onPanResponderGrant(evt: Object, gestureState: Object) {
        this._onPanResponderMove(evt, gestureState);
    }

    _onPanResponderMove(evt: Object, gestureState: Object) {
        const { lastValue } = this.state;
        const { onChange, width } = this.props;

        var cur_pos = this._minimum + (this._maximum-this._minimum) * (gestureState.x0 + gestureState.dx - this._x_pos) / width;
        cur_pos = Math.min(Math.max(cur_pos, this._minimum), this._maximum);
        var cur_value = parseInt(cur_pos);

        if (cur_value !== lastValue && onChange)
            onChange(cur_value);

        this.setState({
            dragging: true,
            lastValue: cur_value,
            currentValue: cur_pos
        });
    }

    _onPanResponderRelease() {
        this.setState({
            dragging: false,
        });
    }

    _measure(callback) {
        this._container_ref.measure((x, y, width, height, pageX, pageY) => {
            this._x_pos = pageX;
            this._y_pos = pageY;

            if (typeof callback == 'function')
                callback();
        });
    }

    render() {
        var { width, height, value, enabled } = this.props;
        const { currentValue, dragging } = this.state;

        if (dragging)
            value = currentValue;

        var margin = 10;
        var barWidth = width - margin;
        var curProgress = barWidth * (value-this._minimum) / (this._maximum-this._minimum);
        var knobY1 = height*(1/3);
        var knobY2 = height*(1.5/3);

        var lines = [];
        for (var i = 0; i < this._numDashes; i++) {
            var progress = i / (this._numDashes-1);
            var lerp = (v, c) => (this._coldColor[c]+(this._hotColor[c]-this._coldColor[c])*v).toFixed(0);
            var color = 'rgb(' + lerp(progress, 'r') + ',' + lerp(progress, 'g') + ',' + lerp(progress, 'b') + ')';
            if (!enabled)
                color = '#666666';
            var x = progress * (barWidth-2) + 1;
            lines.push(<Line key={"svg-line-"+i} x1={x} y1={0} x2={x} y2={height*(2/3)} stroke={color} strokeWidth={2} />);
        }

        return (
            <View style={{width, height}}
                {...this._panResponder.panHandlers}
                onLayout={this._measure.bind(this)}
                ref={c => this._container_ref = c}>
                <Svg width={barWidth} height={height*(2/3)} style={{marginLeft: margin/2}}>
                    {lines}
                </Svg>
                <View style={{position: 'relative', width, height: height*(1.5/3), marginTop: -height*(0.5/3)}}>
                    <View style={{...styles.knob, left: curProgress - 5 + margin/2}}>
                        <Svg width={10} height={height*(2/3)}>
                            <Polygon points={"5,0 10,"+knobY1+" 5,"+knobY2+" 0,"+knobY1} fill={'#ffffff'} strokeWidth={1} />
                        </Svg>
                    </View>
                </View>
            </View>
        );
    }
};

const styles = {
    knob: {
        position: 'absolute',
        width: 10,
    }
};
