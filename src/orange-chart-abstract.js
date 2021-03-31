const OrangeChartAxis = require('./orange-chart-axis')
const {OrangeSVG} = require('orange-svg')

/**
 * Abstract chart
 *
 * @abstract
 */
class OrangeChartAbstract {

  /**
   *
   * @param {object[]} data Array of data rows
   */
  constructor (data) {
    if (data.length < 1) throw new Error('Data array is empty')
    this._data = data
    this._source_mapping = []
    this._default_data_callbacks = {}
    this._custom_data_callbacks = {}
    this._axes = {}
    for (let axis of this.constructor.allowed_axes) {
      this._axes[axis] = new OrangeChartAxis(axis)
    }
  }

  /**
   * Returns allowed axes for the chart
   *
   * @type {string[]}
   * @static
   * @abstract
   */
  static get allowed_axes () {
    throw new Error('get allowed_axes should be overridden')
  }

  /**
   * Axis with dynamic values
   *
   * @type {string}
   * @static
   */
  static get source_axis () {
    return 'y'
  }

  /**
   * Assigns property of data set's objects to be used for source axis
   *
   * @param {string} property
   * @param {?string} color
   * @param {object} callbacks JavaScript callbacks for elements created for representation of the value per property
   * @return {OrangeChartAbstract}
   */
  assignSource (property, color = null, callbacks = {}) {
    this._source_mapping.push({property, color})
    if (this.constructor.allowed_axes.includes(this.constructor.source_axis)) {
      this._axes[this.constructor.source_axis].update({
        'sources': this._source_mapping.map(v => v.property)
      }, this._data)
    }
    this._custom_data_callbacks[property] = callbacks
    return this
  }

  /**
   * Defines default JavaScript callbacks for elements created for representation of the value
   *
   * @param {string} event_name Event name line "click", "mouseover", "mouseleave"
   * @param {function} callback Callback function with arguments: event (DOM Event), object
   * @return {OrangeChartAbstract}
   */
  setDataCallback (event_name, callback) {
    this._default_data_callbacks[event_name] = callback
    return this
  }

  /**
   * Returns callback by property name (default if custom were not defined via OrangeChartAbstract.assignSource
   *
   * @param {string} property
   * @return {object}
   */
  getCallbacks (property) {
    return Object.assign({}, this._default_data_callbacks, this._custom_data_callbacks.hasOwnProperty(property) ? this._custom_data_callbacks[property] : {})
  }

  /**
   * Defines axis configuration
   *
   * @param {string} axis
   * @param {object} config
   * @return {OrangeChartAbstract}
   */
  axis (axis, config) {
    if (!this._axes.hasOwnProperty(axis)) {
      throw new Error(`Axis "${axis}" is not allowed for this type of chart`)
    }
    if (!config.hasOwnProperty('sources') && !config.hasOwnProperty('source') && (axis === this.constructor.source_axis)) {
      if (!this._source_mapping.length) {
        throw new Error(`Assign sources before configuring axes`)
      }
      config['sources'] = this._source_mapping.map(v => v.property)
    }
    if ((this.constructor.source_axis === 'x') && !config.hasOwnProperty('dynamic')) {
      if (axis === 'x') {
        config['dynamic'] = true
      } else if (axis === 'y') {
        config['dynamic'] = false
      }
    }
    this._axes[axis].update(config, this._data)
    return this
  }

  /**
   * Chart type
   *
   * @type {string}
   * @static
   */
  static get chart_type_code () {
    throw new Error('get chart_type_code should be overridden')
  }

  /**
   * Basic dimensions of the chart
   *
   * @param {object} view
   * @return {{width:number, height:number}}
   * @protected
   * @abstract
   */
  _get_basic_dimensions (view) {
    throw new Error('get _get_basic_dimensions should be overridden')
  }

  /**
   * Function for calculating label position for labels on X axis
   *
   * @type {null|{function(number, number, object): number}}
   * @protected
   */
  get _x_axis_label_position_function () {
    return null
  }

  /**
   * Function for calculating label position for labels on Y axis
   *
   * @type {null|{function(number, number, object): number}}
   * @protected
   */
  get _y_axis_label_position_function () {
    return null
  }

  /**
   * Renders Chart in the container
   *
   * @param {HTMLElement|string|null} el Container (string will be used as ID, null - just returns DOM SVG object)
   * @param {object} view Chart view configuration
   * @return {SVGSVGElement}
   */
  render (el = null, view = {}) {
    if (typeof el === 'string') {
      if (!document.getElementById(el)) {
        throw new Error(`HTML element with id "${el}" not found`)
      }
    }
    const svg = this._prepare_svg(view)
    return el === null ? svg.element : svg.render(el)
  }

  /**
   * Returns SVG Object converted to HTML string
   *
   * @param view Chart view configuration
   * @return {string}
   */
  toString (view = {}) {
    return this._prepare_svg(view).toString()
  }

  /**
   * Generates OrangeSVG object
   *
   * @param {object} view Chart view configuration
   * @return {OrangeSVG}
   * @private
   */
  _prepare_svg (view) {
    const svg = new OrangeSVG()
    const dimensions = this._get_basic_dimensions(view)
    const w = {'x1': 0, 'y1': 0, 'x2': dimensions.width, 'y2': dimensions.height}
    const wc = Object.values(this._axes).reduce((a, c) => {
      for (let [k, v] of Object.entries(c.getOffsets(view))) {
        a[k] = Math.max(a[k], v)
      }
      return a
    }, {'x1': 0, 'y1': 0, 'x2': 0, 'y2': 0})
    w.x1 += wc.x1
    w.y1 += wc.y1
    w.x2 -= wc.x2
    w.y2 -= wc.y2
    this._axes.x && this._axes.x.render(svg, view, w.x1, w.y1, w.x2, w.y2, this._x_axis_label_position_function)
    this._axes.y && this._axes.y.render(svg, view, w.x1, w.y1, w.x2, w.y2, this._y_axis_label_position_function)
    this._do_render(svg, view, w.x1, w.y1, w.x2, w.y2)
    svg.w = dimensions.width
    svg.h = dimensions.height
    return svg
  }

  /**
   * Renders chart
   *
   * @param {OrangeSVG} svg
   * @param {object} view
   * @param {number} x1
   * @param {number} y1
   * @param {number} x2
   * @param {number} y2
   * @abstract
   * @protected
   */
  _do_render (svg, view, x1, y1, x2, y2) {
    throw new Error('get _do_render should be overridden')
  }

}

module.exports = OrangeChartAbstract
