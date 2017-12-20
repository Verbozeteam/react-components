/* @flow */

import * as React from 'react';
import ReactDOM from 'react-dom';

import type { LayoutType, StyleType } from './flowtypes';

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

type PropTypes = {
  disabled?: boolean,

  /* provide maximum and minimum inclusive range and round function */
  value?: number,
  maximum?: number,
  minimum?: number,
  round?: (value: number) => number,
  onStart?: (value: number) => null,
  /* onMove doesn't necessarily need to update value passed through props -
     circular slider live updates on it's own */
  onMove?: (value: number) => null,
  /* onRelease must pass updated value through props or else slider will pop
     back to original value */
  onRelease?: (value: number) => null,

  /* size of the circular arc in degrees */
  arc: number,
  diameter: number,

  /* override styling */
  knobGradient?: [string, string],
  knobDisabledGradient?: [string, string],
  highlightGradient?: [string, string],
  backgroundGradient?: [string, string],
  backgroundStroke?: string,
  knobWidth?: number,
  arcWidth?: number,
  arcMargin?: number,

  // TODO: for the future
  nightMode?: boolean
};

type StateType = {
  touch: boolean,
  touch_value: number,
  /* in radians */
  touch_angle: number
};

class GenericCircularSlider extends React.Component<PropTypes, StateType> {

  static defaultProps = {
    disable: false,
    value: 50,
    maximum: 100,
    minimum: 0,
    round: (value) => Math.round(value),
    onStart: () => null,
    onMove: () => null,
    onRelease: () => null,
    arc: 250,
    diameter: 300,
    knobGradient: ['#36DBFD', '#178BFB'],
    knobDisabledGradient: ['#AFAFAF', '#8A8A8A'],
    highlightGradient: ['#41FFFF', '#1CA7FF'],
    backgroundGradient: ['#181B31', '#181B31'],
    backgroundStroke: '#181B31',
    knobDiameter: 50,
    arcWidth: 30,
    arcMargin: 5,
  };

  state = {
    touch: false,
    touch_value: 0,
    touch_angle: 0
  };

  /* info: only calculated once */
  _knob_layout: LayoutType | StyleType;
  _svg_layout: LayoutType | StateType;
  _container_layout: LayoutType;

  /* arc path */
  _arc_path: string;

  /* animated angle */
  _animated_angle: Object;
  _old_angle: number;

  /* reference to container object used to obtain component position */
  _container_ref: Object;

  onMouseDown(evt: Object) {
    const { onStart } = this.props;

    captureMouseEvents(evt, this.onMouseMove.bind(this), this.onMouseUp.bind(this));

    /* get position of element on screen for touch offset calculation */
    var bounds = ReactDOM
      .findDOMNode(this._container_ref)
      .getBoundingClientRect();
    var x = evt.clientX - bounds.left;
    var y = evt.clientY - bounds.top;
    const touch_angle = this.calculateAngleFromCoord(x, y);
    const touch_value = this.calculateValueFromAngle(touch_angle);

    this.setState({
      touch: true,
      touch_angle,
      touch_value
    });

    /* call provided onStart handler */
    onStart(touch_value);
  }

  onMouseMove(evt: Object) {
    const { value, onMove, minimum, maximum } = this.props;
    const { touch_angle, touch_value, touch } = this.state;

    var bounds = ReactDOM
      .findDOMNode(this._container_ref)
      .getBoundingClientRect();
    var x = evt.clientX - bounds.left;
    var y = evt.clientY - bounds.top;
    var new_touch_angle = this.calculateAngleFromCoord(x, y);
    var new_touch_value = this.calculateValueFromAngle(new_touch_angle);

    if (touch) {
      if (Math.abs(new_touch_value - touch_value) > (maximum - minimum) / 2) {
        return;
      }

      this.setState({
        touch_angle: new_touch_angle,
        touch_value: new_touch_value
      });

      /* if value has changed, call provided onMove handler */
      if (value !== touch_value) {
        onMove(touch_value);
      }
    }
  }

  onMouseUp(evt: Object) {
    const { onRelease } = this.props;
    const { touch_value } = this.state;

    this.setState({
      touch: false
    });

    /* call provided onRelease handler */
    onRelease(touch_value);
  }

  calculateAngleFromCoord(x_touch: number, y_touch: number): number {
    const { diameter, arc } = this.props;

    /* normalize touch poitns to circle origin */
    const touch_points = {
      x: x_touch - diameter / 2,
      y: y_touch - diameter / 2,
    };

    /* calculate new angle in radians */
    var angle = Math.atan2(touch_points.y, touch_points.x);

    /* convert angle to degrees with where top of circle is 0, right is positive
       and left is negative */
    var angle_degress = (angle + Math.PI) * 180 / Math.PI - 90;
    if (angle_degress > 180) {
      angle_degress -= 360;
    }

    /* keep angle within bounds of arc */
    if (angle_degress > arc / 2) {
      angle = (arc / 2 - 90) * Math.PI / 180;
    }

    else if (angle_degress < arc / 2 * -1) {
      angle = (arc / 2 * -1 - 90) * Math.PI / 180;
    }

    return angle;
  }

  calculateValueFromAngle(angle: number): number {
    const { touch_value } = this.state;
    const { maximum, minimum, arc, round } = this.props;

    /* convert angle to degrees with where top of circle is 0, right is positive
       and left is negative */
    var angle_degrees = (angle + Math.PI) * 180 / Math.PI - 90;
    if (angle_degrees > 180) {
      angle_degrees -= 360;
    }

    const ratio = arc / (maximum - minimum);
    const angle_from_start = angle_degrees + arc / 2;
    return round(minimum + angle_from_start / ratio);
  }

  calculateAngleFromValue(value: number): number {
    const { maximum, minimum, arc } = this.props;

    /* calculate the angle in degrees, where top of circle is 0 */
    const angle_degrees = arc / (maximum - minimum) * (value - minimum) -
      arc / 2;

    return angle_degrees * Math.PI / 180 - Math.PI / 2;
  }

  calculateKnobPositionFromAngle(angle: number): {left: number, top: number} {
    const { diameter, knobDiameter, arcWidth, arcMargin } = this.props;

    const radius = diameter / 2 - knobDiameter / 2;
    const overflow = (knobDiameter - arcWidth) / 2 - arcMargin;
    return {
      left: (radius + overflow) * Math.cos(angle) + radius + this._svg_layout.left,
      top: (radius + overflow) * Math.sin(angle) + radius + this._svg_layout.top
    }
  }

  createSvgAndContainerLayout() {
    const { diameter, arc, arcWidth, knobDiameter } = this.props;

    const angle = (360 - arc) * Math.PI / 180;

    /* calculate height of circle segment that is not part of arc */
    const extra_height = diameter / 2 * (1 - Math.cos(angle / 2));

    this._svg_layout = {
      height: diameter - extra_height + arcWidth,
      width: diameter,
      top: (knobDiameter - arcWidth) / 4 + 1,
      left: (knobDiameter - arcWidth) / 4 + 1,
      transition: 'left 300ms, top 300ms, right 300ms, bottom 300ms, width 300ms, height 300ms',
    };

    this._container_layout = {
      position: 'relative',
      display: 'flex',
      height: this._svg_layout.height + this._svg_layout.top * 2,
      width: this._svg_layout.width + this._svg_layout.left * 2,
      transition: 'left 300ms, top 300ms, right 300ms, bottom 300ms, width 300ms, height 300ms',
      overflow: 'none',
    };
  }

  createKnobLayout() {
    const { knobDiameter } = this.props;

    /* calculate knob layout and style */
    this._knob_layout = {
      height: knobDiameter,
      width: knobDiameter,
      borderRadius: knobDiameter / 2,
    };
  }

  createArc() {
    const { arc, diameter, arcWidth, arcMargin } = this.props;

    /* calculate the start angle and end angle in radians, where 0 is the
       very top of the circle */
    const start_angle = (arc / 2 - 90) * Math.PI / 180;
    const end_angle = (arc / 2 * -1 - 90) * Math.PI / 180;

    /* calculate the actual radius of the middle of the arc stroke,
       factoring in it's thickness and margin */
    const radius = diameter / 2 - arcWidth / 2 - arcMargin;

    /* calculate the cartesian start and end points */
    const start = {
      x: diameter / 2 + (radius * Math.cos(start_angle)),
      y: diameter / 2 + (radius * Math.sin(start_angle))
    };

    const end = {
      x: diameter / 2 + (radius * Math.cos(end_angle)),
      y: diameter / 2 + (radius * Math.sin(end_angle))
    };

    /* set this flag to true if the arc is greater than 180 degrees
       so the SVG library draws the bigger arc */
    const large_arc_flag = (arc > 180) ? '1' : 0;

    this._arc_path = [
      'M', start.x, start.y,
      'A', radius, radius, 0, large_arc_flag, 0, end.x, end.y
    ].join(' ');
  }

  componentDidUpdate(prevProps: PropTypes) {
    this._old_angle = prevProps.value;
  }

  render() {
    const { diameter, highlightGradient, backgroundGradient,
      backgroundStroke, knobDiameter, arcWidth, arcMargin, round, disabled,
      knobDisabledGradient } = this.props;
    var { value, knobGradient } = this.props;
    const { touch, touch_angle, touch_value } = this.state;

    this.createArc();
    this.createSvgAndContainerLayout();
    this.createKnobLayout();

    var knob_position: {left: number, top: number};
    if (touch) {
      knobGradient = highlightGradient;
      knob_position = this.calculateKnobPositionFromAngle(touch_angle);
      value = touch_value;
    }
    else {
      const angle = this.calculateAngleFromValue(value);
      knob_position = this.calculateKnobPositionFromAngle(angle);
    }

    var mouseEvents = {};
    if (!disabled) {
      mouseEvents = {
        onMouseDown: this.onMouseDown.bind(this),
      }
    } else {
      knobGradient = knobDisabledGradient;
    }

    return (
      <div {...mouseEvents}
        ref={c => this._container_ref = c}
        style={this._container_layout}>
        <svg width={this._svg_layout.width} height={this._svg_layout.height}
          style={{...styles.svg,
            ...{top: this._svg_layout.top, left: this._svg_layout.left}}}>
          <path d={this._arc_path}
            stroke={backgroundStroke} strokeWidth={arcWidth + arcMargin * 2}
              strokeLinecap={'round'} fill={'none'} />
          <path d={this._arc_path}
            stroke={'url(#gradient)'} strokeWidth={arcWidth}
              strokeLinecap={'round'} fill={'none'} />
        </svg>

        <div style={{...styles.knob, ...this._knob_layout, ...knob_position, ...{background: 'linear-gradient(to bottom left, '+highlightGradient[0]+', '+highlightGradient[1]+')'}}}>
        </div>
      </div>
    );
  }
}

const styles = {
  svg: {
    position: 'absolute',
    display: 'flex',
  },
  knob: {
    position: 'absolute',
    display: 'flex',
  }
};

module.exports = GenericCircularSlider;
