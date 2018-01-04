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
  /* provide maximum and minimum inclusive value range and round function */
  value?: number,
  noProgress?: boolean, // makes the slider only render a circle at the value
  diffMode?: boolean, // when true, values change upon moving touches not clicking
  maximum?: number,
  minimum?: number,
  round?: (value: number) => number,
  textGenerator?: (value: number) => string,
  onStart?: () => null,
  /* onMove doesn't necessarily need to update value passed through props -
     slider live updates on it's own */
  onMove?: (value: number) => null,
  /* onRelease must pass updated value through props or else slider will pop
     back to original value */
  onRelease?: (value: number) => null,

  /* override styling */
  orientation?: 'vertical' | 'horizontal',
  icon?: number, /* this must be result of require(<image>) */
  layout?: LayoutType,
  showValue?: boolean,
  fontColor?: string,
  sliderGradient?: [string, string],
  backgroundColor?: string,
  iconBackgroundColor?: string,
  sliderMargin?: number,

  // TODO: for the futrue
  nightMode?: boolean
};

type StateType = {
  touch: boolean,
  touch_value: number,
  touch_start_value: number,
  startX: number,
  startY: number,
};

class GenericSlider extends React.Component<PropTypes, StateType> {

  static defaultProps = {
    orientation: 'horizontal',
    value: 50,
    noProgress: false,
    diffMode: true,
    maximum: 100,
    minimum: 0,
    round: (value: number) => Math.round(value),
    textGenerator: (value: number) => value,
    onStart: () => null,
    onMove: () => null,
    onRelease: () => null,
    showValue: false,
    fontColor: '#FFFFFF',
    sliderGradient: ['#2285d1', '#152747'],
    highlightGradient: ['#32a5e2', '#253757'],
    backgroundColor: '#181B31',
    iconBackgroundColor: '#0C0F26',
    sliderMargin: 2,
    nightMode: true,
  };

  state = {
    touch: false,
    touch_value: 0,
    touch_start_value: 0,
    startX: 0,
    startY: 0,
  };

  /* default height and width for slider if non provided through props */
  _default_height: number = 70;
  _default_width: number = 250;

  _container_layout: LayoutType | StyleType;
  _slider_mask: LayoutType | StyleType;
  _slider_layout: StyleType;
  _ratio: number;
  _icon_container_layout: LayoutType | StyleType;
  _icon_layout: LayoutType;

  onMouseDown(evt: Object) {
    const { diffMode, layout, noProgress, orientation, maximum, minimum, round, onStart } = this.props;
    var { value } = this.props;

    var element = ReactDOM.findDOMNode(this._container_ref);
    captureMouseEvents(evt, this.onMouseMove.bind(this), this.onMouseUp.bind(this));

    if (!diffMode) {
      var bounds = element.getBoundingClientRect();
      var x = evt.clientX - bounds.left;
      var y = evt.clientY - bounds.top;

      console.log(y, layout.height);

      var denominator = this._ratio;
      // if (noProgress)
      //   denominator -= (Math.min(this._slider_mask.height, this._slider_mask.width) / (maximum-minimum)) / 2;
      if (orientation === 'horizontal')
        value = (minimum + (x/layout.width)*(maximum-minimum)) / denominator;
      else
        value = (minimum + ((layout.height-y)/layout.height)*(maximum-minimum)) / denominator;
      console.log(value);
      value = Math.min(Math.max(round(value), minimum), maximum);
    }

    this.setState({
      touch: true,
      startX: evt.clientX,
      startY: evt.clientY,
      touch_value: value,
      touch_start_value: value
    });

    /* call provided onStart handler */
    if (onStart)
      onStart();
  }

  onMouseMove(evt: Object) {
    const { orientation, maximum, minimum, round, onMove } = this.props;
    const { touch, touch_value, touch_start_value, startX, startY } = this.state;

    if (!touch)
      return;

    /* calculate gesture distance and limit value to remain within range */
    var new_value: number;
    if (orientation === 'horizontal') {
      new_value = touch_start_value + ((evt.clientX-startX) / this._ratio);
    }
    else {
      new_value = touch_start_value - ((evt.clientY-startY) / this._ratio);
    }
    var rounded_new_value: number = round(new_value);

    /* keep value within set bounds */
    if (new_value > maximum) {
      rounded_new_value = maximum;
    }

    else if (new_value < minimum) {
      rounded_new_value = minimum;
    }

    this.setState({
      touch_value: rounded_new_value
    });

    /* if rounded value has changed, call provided onMove handler */
    if (rounded_new_value !== round(touch_value)) {
      onMove(rounded_new_value);
    }
  }

  onMouseUp() {
    const { round, onRelease } = this.props;
    const { touch_value } = this.state;

    this.setState({
      touch: false
    });

    /* call provided onRelease handler */
    onRelease(round(touch_value));
  }

  calculateLayout() {
    const { orientation, noProgress, sliderMargin, icon } = this.props;
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

    /* calculate the layout of the slider container */
    this._container_layout = {
      height: layout.height,
      width: layout.width,
      borderRadius: 2, //layout.width / 2
      transition: 'left 300ms, top 300ms, right 300ms, bottom 300ms, width 300ms, height 300ms',
    };

    /* calculate icon layout */
    if (icon) {
      this._container_layout.marginLeft = layout.height / 2 * -1;
      this._container_layout.width -= layout.height;
    }

    this._icon_container_layout = {
      height: layout.height,
      width: layout.height * 3 / 2,
      borderTopLeftRadius: 2, //layout.height / 2,
      borderBottomLeftRadius: 2, //layout.height / 2
      transition: 'left 300ms, top 300ms, right 300ms, bottom 300ms, width 300ms, height 300ms',
    };

    this._icon_layout = {
      height: layout.height * 3 / 4,
      width: layout.height * 3 / 4,
      marginRight: layout.height / 2
    };

    /* calculate the layout of the slider mask */
    this._slider_mask = {
      height: this._container_layout.height - sliderMargin * 2,
      width: this._container_layout.width - sliderMargin * 2,
      top: sliderMargin,
      left: sliderMargin,
      borderRadius: 2, //(this._container_layout.width - sliderMargin * 2) / 2
    };

    /* calculate the border radii of the slider itself depending on
       orientation */
    if (orientation === 'horizontal') {
      this._slider_layout = {
        borderTopRightRadius: this._slider_mask.borderRadius,
        borderBottomRightRadius: this._slider_mask.borderRadius,
      }
    }
    else {
      this._slider_layout = {
        borderTopRightRadius: this._slider_mask.borderRadius,
        borderTopLeftRadius: this._slider_mask.borderRadius,
      };
    }

    if (noProgress)
      this._slider_layout.borderRadius = this._slider_mask.borderRadius;
  }

  calculateSliderRatio() {
    const { orientation, noProgress, maximum, minimum, round } = this.props;
    var { sliderMargin } = this.props;
    if (noProgress)
      sliderMargin += Math.min(this._slider_mask.height, this._slider_mask.width) / 2;

    if (orientation === 'horizontal') {
      this._ratio = (this._container_layout.width - sliderMargin * 2) /
        (maximum - minimum);
    }
    else {
      this._ratio = (this._container_layout.height - sliderMargin * 2) /
        (maximum - minimum);
    }
  }

  render() {
    const { orientation, minimum, maximum, textGenerator, round, fontColor, highlightGradient,
      backgroundColor, showValue, icon, iconBackgroundColor } = this.props;
    var { value, noProgress, sliderGradient } = this.props;
    const { touch, touch_value } = this.state;

    /* recalculate layout and ratio */
    this.calculateLayout();
    this.calculateSliderRatio();

    /* if touches began, override provided value */
    if (touch) {
      value = touch_value;
      sliderGradient = highlightGradient;
    }

    /* calculate the size of slider */
    const slider_size: LayoutType = {};
    if (!noProgress) {
      if (orientation === 'horizontal') {
        const width = (value - minimum) * this._ratio;
        if (width < this._slider_mask.height) {
          slider_size.width = this._slider_mask.height;
          slider_size.left = width - this._slider_mask.height;
        } else {
          slider_size.width = width;
        }
      } else {
        const height = (value - minimum) * this._ratio;
        if (height < this._slider_mask.width) {
          slider_size.height = this._slider_mask.width;
          slider_size.bottom = height - this._slider_mask.width;
        } else {
          slider_size.height = height;
        }
      }
    } else {
      // the slider is only a ball
      slider_size.width = Math.min(this._slider_mask.height, this._slider_mask.width);
      slider_size.height = slider_size.width;
      if (orientation === 'horizontal')
        slider_size.left = (maximum-(value - minimum)) * this._ratio;
      else
        slider_size.top = (maximum-(value - minimum)) * this._ratio;
    }

    var value_text = null;
    if (showValue) {
      value_text = <div style={styles.value_container}>
        <div style={{...styles.value_text, ...{color: fontColor}}}>
          {textGenerator(round(value))}
        </div>
      </div>
    }

    return (
      <div
        onMouseDown={this.onMouseDown.bind(this)}
          ref={c => this._container_ref = c}
        style={styles.container}>
        {(icon) ? <div style={{...this._icon_container_layout,
          ...styles.icon_container, ...{backgroundColor: iconBackgroundColor}}}>
            <img style={this._icon_layout} src={icon} />
          </div> : null}

          <div style={{...this._container_layout, ...{backgroundColor}, ...{position: 'relative'}}}>
            <div style={{...styles.slider_mask, ...this._slider_mask}}>
              <div style={{...styles.slider, ...this._slider_layout, ...slider_size, ...{background: 'linear-gradient(to bottom left, '+sliderGradient[0]+', '+sliderGradient[1]+')'}}} />
              {value_text}
            </div>
          </div>
      </div>
    );
  }
}

const styles = {
  container: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'row',
    transition: 'left 300ms, top 300ms, right 300ms, bottom 300ms, width 300ms, height 300ms',
  },
  icon_container: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  slider_mask: {
    display: 'flex',
    position: 'absolute',
    overflow: 'hidden',
  },
  slider: {
    display: 'flex',
    position: 'absolute',
    height: '100%',
    width: '100%',
    bottom: 0,
    overflow: 'hidden',
    transition: 'left 100ms, top 100ms, right 100ms, bottom 100ms, width 100ms, height 100ms',
  },
  value_container: {
    display: 'flex',
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center'
  },
  value_text: {
    position: 'relative',
    display: 'flex',
    fontSize: 18,
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0)'
  }
};

module.exports = GenericSlider;
