/* @flow */

import * as React from 'react';
import { View, Text, Image, Animated, TouchableOpacity, PanResponder,
   StyleSheet } from 'react-native';

import LinearGradient from 'react-native-linear-gradient';

import type { LayoutType, StyleType } from './flowtypes';

type PropTypes = {
  /* provide two arrays with the same length, the values to be shown in the
     toggle, as well as the respective function calls (actions)*/
  selected?: number,
  values?: Array<string>,
  actions?: Array<() => null>,

  /* override styling */
  // TODO: support vertical, will do once needed though
  orientation?: 'vertical' | 'horizontal',
  icon?: number, /* this must be result of require(<image>) */
  layout?: LayoutType,
  fontColor?: string,
  selectedGradient?: [string, string],
  highlightGradient?: [string, string],
  backgroundColor?: string,
  iconBackgroundColor?: string,
  selectedMargin?: number,

  //TODO: for the future
  nightMode?: boolean
};

type StateType = {
  touch: boolean;
};

class GenericToggle extends React.Component<PropTypes, StateType> {

  static defaultProps = {
    selected: 0,
    values: ['On', 'Off'],
    actions: [() => null, () => null],
    orientation: 'horizontal',
    layout: {
      height: 70,
      width: 250
    },
    fontColor: '#FFFFFF',
    selectedGradient: ['#36DBFD', '#178BFB'],
    highlightGradient: ['#41FFFF', '#1CA7FF'],
    backgroundColor: '#181B31',
    iconBackgroundColor: '#0C0F26',
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
  _icon_container_layout: LayoutType | StyleType;
  _icon_layout: LayoutType;

  /* info: only created once, if values change or actions changes update
     won't show until component is remounted */
  _values: Array<React.ComponentType>;
  _num_values: number;

  /* touch responder */
  _panResponder: Object;

  /* component x-axis and y-axis position relative to screen */
  _x_pos: number;
  _y_pos: number;

  /* reference to container object used to obtain component position */
  _container_ref: Object;

  componentWillMount() {
    const { layout, values, icon, selected, selectedMargin } = this.props;

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

    /* calculate container layout and selected layout */
    this._container_layout = {
      height: layout.height,
      width: layout.width,
      borderRadius: layout.height / 2,
    };

    this._selected_layout = {
      position: 'absolute',
      height: layout.height - selectedMargin * 2,
      // TODO: make this dynamic to values array strings lengths
      width: layout.width / values.length,
      borderRadius: (layout.height - selectedMargin * 2) / 2,
      top: selectedMargin
    };

    /* calculate icon layout */
    if (icon) {
      this._container_layout.marginLeft = layout.height / 2 * -1;

      this._icon_container_layout = {
        height: layout.height,
        width: layout.height + (layout.height / 2),
        borderTopLeftRadius: layout.height / 2,
        borderBottomLeftRadius: layout.height / 2
      };

      this._icon_layout = {
        height: layout.height / 2,
        width: layout.height / 2,
        marginRight: layout.height / 2,
      };
    }

    var position: number = this._selected_layout.width * selected;
    if (selected === 0) {
      position += selectedMargin;
    }
    else if (selected === values.length - 1) {
      position -= selectedMargin;
    }

    this._animation_position = new Animated.Value(position);

    this.createValues();
  }

  _onPanResponderGrant(evt: Object, gestureState: {x0: number}) {

    /* get position of element on screen for touch offset calculation */
    this._measure(() => {
      this.updateSelected(gestureState.x0);

      this.setState({
        touch: true
      });
    });
  }

  _onPanResponderMove(evt: Object, gestureState: {moveX: number}) {
    this.updateSelected(gestureState.moveX)
  }

  _onPanResponderRelease() {
    this.setState({
      touch: false
    });
  }

  updateSelected(x_touch: number) {
    const { selected, actions } = this.props;

    /* get index of toggle position of touch x position */
    const x = x_touch - this._x_pos;
    var index = Math.floor(x / this._selected_layout.width);

    /* if index out of bounds set within bounds */
    if (index >= this._values.length) {
      index = this._values.length - 1;
    }

    else if (index < 0) {
      index = 0
    }

    /* only call action if index has changed */
    if (index !== selected) {
      actions[index]();
    }
  }

  createValues() {
    const { values, icon, selectedMargin, fontColor } = this.props;

    this._values = [];

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

  _measure(callback) {
    this._container_ref.measure((x, y, width, height, pageX, pageY) => {
      this._x_pos = pageX;
      this._y_pos = pageY;

      if (typeof callback == 'function') {
        callback();
      }
  }

  render() {
    const { highlightGradient, backgroundColor, icon, iconBackgroundColor }
      = this.props;
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
      <View style={styles.container}>
        {(icon) ?
          <View style={[this._icon_container_layout,
            styles.icon_container, {backgroundColor: iconBackgroundColor}]}>
            <Image style={this._icon_layout} source={icon} />
          </View> : null}
        <View {...this._panResponder.panHandlers}
          ref={c => this._container_ref = c}
          onLayout={this._measure.bind(this)}
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
  values_container: {
    position: 'absolute',
    height: '100%',
    width: '100%',
    flexDirection: 'row',
  },
  icon: {
    marginLeft: -35,
    height: 60,
    width: 60
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
