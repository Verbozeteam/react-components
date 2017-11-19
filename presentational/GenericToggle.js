/* @flow */

import * as React from 'react';
import { View, Text, Animated, TouchableOpacity, PanResponder,
   StyleSheet } from 'react-native';

import LinearGradient from 'react-native-linear-gradient';

import type { LayoutType, StyleType } from './flowtypes';

type PropsType = {
  // TODO: support vertical, will do once needed though
  orientation?: 'vertical' | 'horizontal',

  /* provide two arrays with the same length, the values to be shown in the
     toggle, as well as the respective function calls (actions)*/
  selected?: number,
  values?: Array<string>,
  actions?: Array<() => null>,

  /* override styling */
  layout?: LayoutType,
  fontColor?: string,
  selectedGradient?: [string, string],
  highlightGradient?: [string, string],
  backgroundColor?: string,
  selectedMargin?: number,

  //TODO: for the future
  nightMode?: boolean
};

type StateType = {
  touch: boolean;
};

class GenericToggle extends React.Component<PropsType, StateType> {

  static defaultProps = {
    orientation: 'horizontal',
    selected: 0,
    values: ['On', 'Off'],
    actions: [() => null, () => null],
    layout: {
      height: 70,
      width: 250
    },
    fontColor: '#FFFFFF',
    selectedGradient: ['#36DBFD', '#178BFB'],
    highlightGradient: ['#41FFFF', '#1CA7FF'],
    backgroundColor: '#181B31',
    selectedMargin: 5,
    nightMode: true,
  };

  state = {
    touch: false
  };

  /* animated offset of the toggle selector */
  _animation_position: Object;

  /* info: only calculated once using layout in props, if layout changes
     these do not update unless the component is remounted */
  _container_layout: LayoutType | StyleType;
  _selected_layout: LayoutType | StyleType;


  /* info: only created once, if values change or actions changes update
     won't show until component is remounted */
  _values: Array<React.ComponentType> = [];

  /* touch responder */
  _panResponder: Object;

  /* component x-axis position relative to screen */
  _x_pos: number;

  componentWillMount() {
    const { layout, values, selectedMargin } = this.props;

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

    this._container_layout = {
      height: layout.height,
      width: layout.width,
      borderRadius: layout.height / 2
    };

    this._selected_layout = {
      position: 'absolute',
      height: layout.height - selectedMargin * 2,
      // TODO: make this dynamic to values array strings lengths
      width: layout.width / values.length,
      borderRadius: (layout.height - selectedMargin * 2) / 2,
      top: selectedMargin
    };

    this._animation_position = new Animated.Value(selectedMargin);

    this.createValues();
  }

  _onPanResponderGrant() {
    this.setState({
      touch: true
    });
  }

  _onPanResponderMove(evt: Object, gestureState: {moveX: number}) {
    const { selected, actions } = this.props;

    /* get index of toggle position of touch x position */
    const x = gestureState.moveX - this._x_pos;
    var index = Math.floor(x / this._selected_layout.width);


    /* if index out of bounds set within bounds */
    if (index >= this._values.length) {
      index = this._values.length - 1;
    }

    else if (index < 0) {
      index = 0;
    }

    /* only call action if index has changed */
    if (index !== selected) {
      actions[index]();
    }

  }

  _onPanResponderRelease(evt: Object, gestureState: {moveX: number}) {
    this._onPanResponderMove(evt, gestureState);

    this.setState({
      touch: false
    });
  }

  createValues() {
    const { values, selectedMargin, fontColor } = this.props;

    /* loop through all values provided and create respective JSX */
    for (var i = 0; i < values.length; i++) {
      const value_style: StyleType = {
        color: fontColor
      };
      /* create left or right margin if value is first or last */
      if (i === 0) {
        value_style.marginLeft = selectedMargin;
      }
      else if (i === values.length - 1) {
        value_style.marginRight = selectedMargin;
      }

      this._values.push(
        <View key={'value' + i} style={styles.value}>
          <Text style={[styles.value_text, value_style]}>
            {values[i]}
          </Text>
        </View>
      );
    }
  }

  calculateAnimationPosition() {
    const { selected, selectedMargin, values } = this.props;

    var position: number = this._selected_layout.width * selected;
    if (selected === 0) {
      position += selectedMargin;
    }
    else if (selected === values.length - 1) {
      position -= selectedMargin;
    }

    Animated.timing(this._animation_position, {
      toValue: position,
      duration: 150
    }).start();
  }

  _onLayout(event: Object) {
    this._x_pos = event.nativeEvent.layout.x;
  }

  render() {
    const { highlightGradient, backgroundColor } = this.props;
    var { selectedGradient } = this.props;
    const { touch } = this.state;

    /* calculate animation position of toggle selector */
    this.calculateAnimationPosition();

    const selected_position: LayoutType = {
      left: this._animation_position
    };

    if (touch) {
      selectedGradient = highlightGradient;
    }

    return (
      <View {...this._panResponder.panHandlers}
        onLayout={this._onLayout.bind(this)}
        style={[this._container_layout, {backgroundColor}]}>
        <Animated.View style={selected_position}>
          <LinearGradient colors={selectedGradient}
            start={{x: 1, y: 0}} end={{x: 0, y: 1}}
            style={this._selected_layout}>
          </LinearGradient>
        </Animated.View>

        <View style={styles.values_container}>
          {this._values}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  values_container: {
    position: 'absolute',
    height: '100%',
    width: '100%',
    flexDirection: 'row',
  },
  value: {
    flex: 1,
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

module.exports = GenericToggle;
