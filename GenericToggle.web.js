/* @flow */

import * as React from 'react';
import ReactDOM from 'react-dom';

const EventListenerMode = {capture: true};
var global_lsiteners = {};

function preventGlobalMouseEvents () {
  document.body.style['pointer-events'] = 'none';
}

function restoreGlobalMouseEvents () {
  document.body.style['pointer-events'] = 'auto';
}

function mousemoveListener (e) {
  e.stopPropagation ();
  // do whatever is needed while the user is moving the cursor around
}

function mouseupListener (e) {
  document.removeEventListener ('mouseup',   global_lsiteners.up,   EventListenerMode);
  document.removeEventListener ('mousemove', global_lsiteners.move, EventListenerMode);
  e.stopPropagation ();
}

function captureMouseEvents (e, onmove, onup) {
  global_lsiteners.up = e => {mouseupListener(e); onup(e)};
  global_lsiteners.move = e => {mousemoveListener(e); onmove(e)};
  document.addEventListener ('mouseup',   global_lsiteners.up,   EventListenerMode);
  document.addEventListener ('mousemove', global_lsiteners.move, EventListenerMode);
  e.preventDefault ();
  e.stopPropagation ();
}

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
    selectedGradient: ['#2285d1', '#152747'],
    highlightGradient: ['#32a5e2', '#253757'],
    backgroundColor: '#181B31',
    iconBackgroundColor: '#0C0F26',
    selectedMargin: 2,
    nightMode: true,
  };

  state = {
    touch: false,
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

  /* component x-axis and y-axis position relative to screen */
  _x_pos: number;
  _y_pos: number;

  /* reference to container object used to obtain component position */
  _container_ref: Object;

  onMouseDown(e: Object) {
    const { selected, actions } = this.props;

    captureMouseEvents(e, this.onMouseMove.bind(this), this.onMouseUp.bind(this));

    /* set to false whenever touches begin */
    this._has_sent = false;

    var bounds = ReactDOM
      .findDOMNode(this._container_ref)
      .getBoundingClientRect();
    var x = e.clientX - bounds.left;
    var y = e.clientY - bounds.top;
    const index = this.getTouchIndex(x, y);


    /* only call action if index has changed */
    if (index !== selected) {
      actions[index]();
      this._has_sent = true;
    }

    this.setState({
      touch: true,
    });
  }

  onMouseMove(e: Object) {
    const { selected, actions } = this.props;
    const { touch } = this.state;

    var bounds = ReactDOM
      .findDOMNode(this._container_ref)
      .getBoundingClientRect();
    var x = e.clientX - bounds.left;
    var y = e.clientY - bounds.top;
    const index = this.getTouchIndex(x, y);

    if (index !== selected && touch) {
      actions[index]();
      this._has_sent = true;
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

  getTouchIndex(x: number, y: number): number {
    const { selected, actions, orientation } = this.props;

    var index = 0;
    if (orientation === 'horizontal') {
      /* get index of toggle position of touch x position */
      index = Math.floor(this.props.values.length * x / this._container_layout.width);
    } else {
      /* get index of toggle position of touch y position */
      index = Math.floor(this.props.values.length * y / this._container_layout.height);
    }

    /* if index out of bounds set within bounds */
    return Math.min(Math.max(index, 0), this._values.length - 1);
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
          <div style={{...styles.value_text, ...value_style}}>
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

    this._animation_position = position;

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
      position: 'relative',
      display: 'flex',
      height: layout.height,
      width: layout.width,
      borderRadius: 2,//layout.height / 2,
      transition: 'left 300ms, top 300ms, right 300ms, bottom 300ms, width 300ms, height 300ms',
    };

    this._selected_layout = {
      position: 'absolute',
      borderRadius: 2,//(layout.height - selectedMargin * 2) / 2,
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
      //this._container_layout.marginLeft = layout.height / 2 * -1;

      this._icon_container_layout = {
        height: layout.height,
        width: layout.height * 3 / 2,
        borderTopLeftRadius: 2,//layout.height / 2,
        borderBottomLeftRadius: 2,//layout.height / 2
      };

      this._icon_layout = {
        height: layout.height / 2,
        width: layout.height / 2,
        marginRight: 2,//layout.height / 2,
      };
    }
  }

  render() {
    const { highlightGradient, backgroundColor, icon, iconBackgroundColor,
      orientation } = this.props;
    var { selectedGradient } = this.props;
    const { touch } = this.state;

    this.calculateLayout();
    this.calculateAnimationPosition(true);
    this.createValues();

    /* calculate animation position of toggle selector */
    this.calculateAnimationPosition();

    var selected_position: LayoutType = {position: 'relative', display: 'flex'};
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
          style={{...this._container_layout, ...{backgroundColor}}}>
          <div style={selected_position}>
            <div style={{...this._selected_layout, ...{background: 'linear-gradient(to bottom left, '+selectedGradient[0]+', '+selectedGradient[1]+')'}}} />
          </div>

          <div style={{...styles.values_container,
            ...{flexDirection: (orientation == 'horizontal') ? 'row' : 'column'}}}>
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
    flexDirection: 'row',
    transition: 'left 300ms, top 300ms, right 300ms, bottom 300ms, width 300ms, height 300ms',
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
    fontSize: 18,
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0)'
  }
};

module.exports = GenericToggle;
