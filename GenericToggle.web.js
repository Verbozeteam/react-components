/* @flow */

import * as React from 'react';

type LayoutType = {
  width: number,
  height: number,
  top: number,
  left: number,
};

type StyleType = Object;

type PropTypes = {
  /* provide two arrays with the same length, the values to be shown in the
     toggle, as well as the respective function calls (actions)*/
  selected?: number,
  values?: Array<string>,
  actions?: Array<() => null>,
  sameSameValue?: boolean,

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
  startX: number,
  startY: number,
};

class GenericToggle extends React.Component<PropTypes, StateType> {

  static defaultProps = {
    selected: 0,
    values: ['On', 'Off'],
    actions: [() => null, () => null],
    sameSameValue: false,
    orientation: 'horizontal',
    fontColor: '#FFFFFF',
    selectedGradient: ['#36DBFD', '#178BFB'],
    highlightGradient: ['#41FFFF', '#1CA7FF'],
    backgroundColor: '#181B31',
    iconBackgroundColor: '#0C0F26',
    selectedMargin: 5,
    nightMode: true,
  };

  state = {
    touch: false,
    startX: 0,
    startY: 0,
  };

  /* default height and width for toggle if non provided through props */
  _default_height: number = 70;
  _default_width: number = 250;

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
  _values: Array<any>;
  _num_values: number;

  /* used in conjuction withs sameSame to determine whether to send or not
     when touch ends */
  _has_sent: boolean;
  _measured: boolean;

  /* component x-axis and y-axis position relative to screen */
  _x_pos: number;
  _y_pos: number;

  /* reference to container object used to obtain component position */
  _container_ref: Object;

  componentWillMount() {
    this.calculateLayout();
    this.calculateAnimationPosition(true);
    this.createValues();
  }

  onMouseDown(e: Object) {
    const { selected, actions } = this.props;

    /* set to false whenever touches begin */
    this._has_sent = false;
    this._measured = false;

    /* get position of element on screen for touch offset calculation */
    this._measure(() => {
      this._measured = true;

      const index = this.getTouchIndex(e.clientX, e.clientY);

      /* only call action if index has changed */
      if (index !== selected) {
        actions[index]();
        this._has_sent = true;
      }

      this.setState({
        touch: true,
        startX: e.clientX,
        startY: e.clientY,
      });
    });
  }

  onMouseMove(e: Object) {
    const { selected, actions } = this.props;
    const { startX, startY } = this.state;

    if (this._measured) {
      const index = this.getTouchIndex(e.clientX - startX, e.clientY - startY);

      if (index !== selected) {
        actions[index]();
        this._has_sent = true;
      }
    }
  }

  onMouseUp() {
    const { selected, actions, sameSameValue } = this.props;

    if (sameSameValue && !this._has_sent) {
      actions[selected]();
    }

    this.setState({
      touch: false
    });
  }

  getTouchIndex(x_touch: number, y_touch: number): number {
    const { selected, actions, orientation } = this.props;

    var index = 0;
    if (orientation === 'horizontal') {
      /* get index of toggle position of touch x position */
      const x = x_touch - this._x_pos;
      index = Math.floor(x / this._selected_layout.width);
    }

    else {
      /* get index of toggle position of touch y position */
      const y = y_touch - this._y_pos;
      index = Math.floor(y / this._selected_layout.width);
    }

    /* if index out of bounds set within bounds */
    if (index >= this._values.length) {
      index = this._values.length - 1;
    }

    else if (index < 0) {
      index = 0;
    }

    return index;
  }

  createValues() {
    const { values, icon, orientation, selectedMargin, fontColor } = this.props;

    this._values = [];

    /* loop through all values provided and create respective JSX */
    for (var i = 0; i < values.length; i++) {
      const value_style: StyleType = {
        color: fontColor
      };
      /* create left or right margin if value is first or last */
      if (i === 0) {
        if (orientation === 'horizontal') {
          value_style.marginLeft = selectedMargin;
        } else {
          value_style.marginTop = selectedMargin;
        }
      }
      else if (i === values.length - 1) {
        if (orientation === 'horizontal') {
          value_style.marginRight = selectedMargin;
        } else {
          value_style.marginBottom = selectedMargin;
        }
      }

      this._values.push(
        <div key={'value' + i} style={styles.value}>
          <div style={[styles.value_text, value_style]}>
            {values[i]}
          </div>
        </div>
      );
    }
  }

  calculateAnimationPosition(initial?: boolean) {
    const { orientation, selected, selectedMargin, values } = this.props;

    var position: number = 0;
    if (orientation === 'horizontal') {
      position = this._selected_layout.width * selected;
    } else {
      position = this._selected_layout.height * selected;
    }


    if (selected === 0) {
      position += selectedMargin;
    }
    else if (selected === values.length - 1) {
      position -= selectedMargin;
    }

    if (initial) {
      //this._animation_position = new Animated.Value(position);
    }

    else {
      /*Animated.timing(this._animation_position, {
        toValue: position,
        duration: 150
      }).start();*/
    }
  }

  calculateLayout() {
    const { orientation, selectedMargin, icon, selected, values } = this.props;
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

    /* calculate container layout and selected layout */
    this._container_layout = {
      height: layout.height,
      width: layout.width,
      borderRadius: layout.height / 2,
    };

    this._selected_layout = {
      position: 'absolute',
      borderRadius: (layout.height - selectedMargin * 2) / 2,
    };

    if (orientation === 'horizontal') {
      this._selected_layout.height = layout.height - selectedMargin * 2;
      this._selected_layout.width = layout.width / values.length;
      this._selected_layout.top = selectedMargin;
    }

    else {
      this._selected_layout.height = layout.height / values.length;
      this._selected_layout.width = layout.width  - selectedMargin * 2;
      this._selected_layout.left = selectedMargin;
    }

    /* calculate icon layout */
    if (icon) {
      this._container_layout.marginLeft = layout.height / 2 * -1;

      this._icon_container_layout = {
        height: layout.height,
        width: layout.height * 3 / 2,
        borderTopLeftRadius: layout.height / 2,
        borderBottomLeftRadius: layout.height / 2
      };

      this._icon_layout = {
        height: layout.height / 2,
        width: layout.height / 2,
        marginRight: layout.height / 2,
      };
    }
  }

  _measure(callback) {
    this._container_ref.measure((x, y, width, height, pageX, pageY) => {
      this._x_pos = pageX;
      this._y_pos = pageY;

      if (typeof callback == 'function') {
        callback();
      }
    });
  }

  render() {
    const { highlightGradient, backgroundColor, icon, iconBackgroundColor,
      orientation } = this.props;
    var { selectedGradient } = this.props;
    const { touch } = this.state;

    /* calculate animation position of toggle selector */
    this.calculateAnimationPosition();

    const selected_position: LayoutType = {};
    if (orientation === 'horizontal') {
      selected_position.left = this._animation_position;
    } else {
      selected_position.top = this._animation_position;
    }

    if (touch) {
      selectedGradient = highlightGradient;
    }

    return (
      <div style={styles.container}>
        {(icon) ?
          <div style={{...this._icon_container_layout,
            ...styles.icon_container, ...{backgroundColor: iconBackgroundColor}}}>
            <img style={this._icon_layout} src={icon} />
          </div> : null}
        <div
          onMouseDown={this.onMouseDown.bind(this)}
          onMouseMove={this.onMouseMove.bind(this)}
          onMouseUp={this.onMouseUp.bind(this)}
          ref={c => this._container_ref = c}
          onLayout={this._measure.bind(this)}
          style={[this._container_layout, {backgroundColor}]}>
          <div style={selected_position}>
            <div style={{...this._selected_layout, ...{background: 'linear-gradient(to bottom left, '+selectedGradient[0]+', '+selectedGradient[1]+')'}}} />
          </div>

          <div style={[styles.values_container,
            {flexDirection: (orientation == 'horizontal') ? 'row' : 'column'}]}>
            {this._values}
          </div>
        </div>
      </div>
    );
  }
}

const styles = {
  container: {
    display: 'flex',
    position: 'relative',
    flexDirection: 'row'
  },
  icon_container: {
    display: 'flex',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center'
  },
  values_container: {
    display: 'flex',
    position: 'absolute',
    height: '100%',
    width: '100%',
  },
  icon: {
    display: 'flex',
    position: 'relative',
    marginLeft: -35,
    height: 60,
    width: 60
  },
  value: {
    display: 'flex',
    position: 'relative',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  value_text: {
    display: 'flex',
    position: 'relative',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0)'
  }
};

module.exports = GenericToggle;
