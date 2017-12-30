/* @flow */

import * as React from 'react';

type PropTypes = {
  icon?: number, /* this must be result of require(<image>) */
  action?: () => null,
  pressIn?: () => null,
  pressOut?: () => null,
  disabled?: boolean,


  /* override styling */
  layout?: {
    width: number,
    height: number,
    top: number,
    left: number,
  },
  style?: Object,
  buttonGradient?: [string, string],
  backgroundColor?: string,
  highLightGradient?: [string, string],
  disabledGradient?: [string, string],
  buttonMargin?: string,
  borderRadius?: number, /* number between 0 - 1 */
};

type StateType = {
  pressed: boolean
};

class GenericButton extends React.Component<PropTypes, StateType> {

  static defaultProps = {
    action: () => null,
    pressIn: () => null,
    pressOut: () => null,
    disabled: false,

    layout: {
      height: 80,
      width: 80,
    },
    style: {},
    buttonGradient: ['#2285d1', '#152747'],
    backgroundColor: '#181B31',
    highLightGradient: ['#32a5e2', '#253757'],
    disabledGradient: ['#AFAFAF', '#8A8A8A'],
    buttonMargin: 2,
    borderRadius: 1,
  };

  state = {
    pressed: false
  };

  /* calculated layout */
  _container_layout: Object;
  _button_layout: Object;

  calculateLayout() {
    const { layout, buttonMargin, borderRadius } = this.props;

    this._container_layout = {
      position: 'relative',
      display: 'flex',
      height: layout.height,
      width: layout.width,
      borderRadius: 2,//(layout.height / 2) * borderRadius
    };

    this._button_layout = {
      position: 'relative',
      display: 'flex',
      height: layout.height - buttonMargin * 2,
      width: layout.width - buttonMargin * 2,
      top: buttonMargin,
      left: buttonMargin,
      borderRadius: 2,//(layout.height - (buttonMargin * 2)) / 2 * borderRadius
    };
  }

  _onTouchStart() {
    const { disabled, action, pressIn } = this.props;

    if (!disabled) {
      if (pressIn)
        pressIn();
      if (action)
        action();

      this.setState({
        pressed: true
      });
    }
  }

  _onTouchEnd() {
    const { disabled, pressOut } = this.props;
    if (!disabled) {
      if (pressOut)
        pressOut();
    }
    this.setState({
      pressed: false
    });
  }

  render() {
    const { layout, backgroundColor, highLightGradient, disabledGradient,
      style, buttonMargin, disabled, icon } = this.props;
    var { buttonGradient } = this.props;
    const { pressed } = this.state;

    this.calculateLayout();

    if (pressed) {
      buttonGradient = highLightGradient;
    }

    if (disabled) {
      buttonGradient = disabledGradient;
    }

    var containerStyle = {
      ...this._container_layout,
      ...style,
      backgroundColor,
      transition: 'left 300ms, top 300ms, right 300ms, bottom 300ms, width 300ms, height 300ms',
    };
    var gradientStyle = {
      ...this._button_layout,
      background: 'linear-gradient(to bottom left, '+buttonGradient[0]+', '+buttonGradient[1]+')',
      transition: 'left 300ms, top 300ms, right 300ms, bottom 300ms, width 300ms, height 300ms',
    };
    var imgStyle = {
      ...this._button_layout,
      position: 'unset',
      width: '100%',
      height: '100%',
      backgroundRepeat: 'no-repeat',
      backgroundSize: '50% 50%',
      backgroundPosition: 'center',
    };

    if (icon)
      imgStyle.backgroundImage = 'url(' + icon + ')';

    return (
      <div style={containerStyle}
        onMouseDown={this._onTouchStart.bind(this)}
        onMouseUp={this._onTouchEnd.bind(this)}>
        <div style={gradientStyle}>
          <div style={imgStyle}>
          </div>
        </div>
      </div>
    )
  }
}

const styles = {
  button: {
    alignItems: 'center',
    justifyContent: 'center'
  }
};

module.exports = GenericButton;
