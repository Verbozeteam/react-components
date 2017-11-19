/* @flow */

import * as React from 'react';

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

type StateType = {};

class GenericToggle extends React.Component<PropsType, StateType> {

  render() {
    return (
      <div>

      </div>
    );
  }
}

module.exports = GenericToggle;
