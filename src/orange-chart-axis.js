const {OrangeSVGLine, OrangeSVGText} = require('orange-svg')

class OrangeChartAxis {

  /**
   *
   * @param {string} axis
   */
  constructor (axis) {
    this.axis = axis
    this._config = {
      'sources': [],
      'lines': false,
      'label': false,
      'cumulative': axis === 'z',
      'dynamic': axis !== 'x',
      'color': false,
      'min': null,
      'max': null
    }
  }

  /**
   *
   * @param {object} config Config, "source" property defines one property for values, "sources" - multiple
   * @param {object[]} data Chart's data
   */
  update (config, data) {
    let sources
    if (config.hasOwnProperty('sources')) {
      sources = config.sources
    } else if (config.hasOwnProperty('source')) {
      sources = [config.source]
    } else {
      sources = []
    }
    Object.assign(this._config, config, {sources})
    this._data = data
  }

  /**
   * Name of the first property used as data source
   *
   * @type {?string}
   */
  get source () {
    return this._config.sources.length ? this._config.sources[0] : null
  }

  /**
   *
   * @param {function(number, number): number} comparison_function
   * @return {number|null}
   * @private
   */
  _getSomethingFromData (comparison_function) {
    let v = null
    let tmp
    for (const row of this._data) {
      if (this._config.cumulative) {
        tmp = this._config.sources.reduce((a, c) => {
          return a + row[c]
        }, 0)
        v = v === null ? tmp : comparison_function(tmp, v)
      } else {
        for (const source of this._config.sources) {
          v = v === null
            ? row[source]
            : comparison_function(row[source], v)
        }
      }
    }
    return v
  }

  /**
   * Returns maximal value for the axis
   * @return {number}
   */
  getMaxFromData () {
    return this._getSomethingFromData(Math.max)
  }

  /**
   * Returns minimal value for the axis
   * @return {number}
   */
  getMinFromData () {
    return this._getSomethingFromData(Math.min)
  }

  /**
   * Returns offsets for axis rendering
   *
   * @param view
   * @return {*}
   */
  getOffsets (view) {
    const default_margin = view.hasOwnProperty('default_margin') ? view.default_margin : 10
    if (this._config.label) {
      if (this.axis === 'x') {
        const y2m = this._config.title ? 6 : 3
        return {
          'x1': 4 * default_margin,
          'x2': 4 * default_margin,
          'y2': y2m * default_margin
        }
      } else if (this.axis === 'y') {
        return {
          'x1': 8 * default_margin,
          'y1': default_margin,
          'y2': default_margin
        }
      }
    }
    return {}
  }

  /**
   * Minimal and maximal value for the axis
   *
   * @type {{min: number|null, max: number|null}|null}
   */
  get scale () {
    if (!this._config.sources.length) {
      return null
    }
    let min = this._config.min
    let max = this._config.max
    if (min === null) {
      min = this._config.dynamic ? this.getMinFromData() : 0
    }
    if (max === null) {
      max = this._config.dynamic ? this.getMaxFromData() : (this._data.length - 1)
    }
    return {min, max}
  }

  /**
   *
   * @param {OrangeSVG} svg
   * @param {string} label
   * @param {number} x
   * @param {number} y
   * @param {string} anchor
   * @private
   */
  static _addLabel (svg, label, x, y, anchor = 'middle') {
    const text = new OrangeSVGText(label, x, y, anchor)
    text.args = {'class': 'orange-chart-label'}
    svg.appendChild(text)
  }

  /**
   * Returns if axis is supposed to be dynamic
   *
   * @return {boolean}
   */
  get dynamic () {
    return !!this._config.dynamic
  }

  /**
   * Returns if values used for the axis is cumulative
   *
   * @return {boolean}
   */
  get cumulative () {
    return !!this._config.cumulative
  }

  /**
   * Axis color
   *
   * @type {string}
   */
  static get COLOR () {
    return this._color || 'rgba(127,127,127,0.2)'
  }

  /**
   * Axis color
   *
   * @type {string}
   */
  static set COLOR (value) {
    this._color = value
  }

  /**
   *
   * @param {number} min
   * @param {number} max
   * @param {number} n
   * @return {number}
   * @private
   */
  static _p (min, max, n) {
    if (min === max) return -1;
    const p = Math.round(Math.log((max - min) / (n - 1)) / Math.log(10)) * -1
    return Math.min(p, 99);
  }

  /**
   * Render axis
   *
   * @param {OrangeSVG} svg
   * @param {object} view
   * @param {number} x1
   * @param {number} y1
   * @param {number} x2
   * @param {number} y2
   * @param {null|function(number, number, object): number} label_position_function
   */
  render (svg, view, x1, y1, x2, y2, label_position_function = null) {
    const n = this._config.dynamic ? 11 : this._data.length // TODO What if too much rows...
    const scale = this.scale
    if (!scale) {
      throw new Error(`Source for axis "${this.axis}" is not defined`)
    }
    const thickness = view.hasOwnProperty('line_thickness') ? view.line_thickness : null
    const color = view.hasOwnProperty('line_color') ? view.line_color : this.constructor.COLOR
    const default_margin = view.hasOwnProperty('default_margin') ? view.default_margin : 10
    const is_vertical = this.axis === 'y'
    const size = is_vertical ? (y2 - y1) : (x2 - x1)
    const length = is_vertical ? (x2 - x1) : (y2 - y1)
    const margin = size / (n - 1)
    let position, label_text
    const p = (scale.min !== null) && (scale.max !== null) ? this.constructor._p(scale.min, scale.max, n) : -1
    const show_every_n = n > 21 ? Math.floor((n - 1) / 10) : 1
    for (let i = 0; i < n; i++) {
      if (i % show_every_n) continue
      position = i * margin
      if (this._config.lines) {
        const line = new OrangeSVGLine(
          (is_vertical ? 0 : position) + x1,
          (is_vertical ? position : 0) + y1,
          (is_vertical ? length : position) + x1,
          (is_vertical ? position : length) + y1,
          color,
          thickness
        )
        line.args = {'class': `orange-chart-scale orange-chart-scale-${this.axis}`}
        svg.appendChild(line)
      }
      if (this._config.label) {
        let label_text
        if (this._config.dynamic) {
          const format_function = (lt => (p + 1) > 0 ? lt.toFixed(p + 1) : Math.round(lt).toString())
          const range = scale.max - scale.min
          let v
          const real_n = n - 1
          if (this._config.log) {
            if (is_vertical) {
              v = real_n !== i ? Math.pow(Math.E, (real_n - i) / real_n * Math.log(range) ) : 0
            } else {
              v = i ? Math.pow(Math.E, i / real_n * Math.log(range) ) : 0
            }
          } else {
            v = (is_vertical ? (real_n - i) : i) / real_n * range
          }
          label_text = format_function(v + scale.min)
        } else {
          label_text = this._data[i][this._config.sources[0]]
        }
        this.constructor._addLabel(
          svg,
          typeof this._config.label === 'function' ? this._config.label(label_text) : label_text,
          (is_vertical ? (-1 * default_margin) : (label_position_function ? label_position_function(i, size, view) : position)) + x1,
          (is_vertical ? ((label_position_function ? label_position_function(i, size, view) : position) + 0.5 * default_margin) : (length + 2.25 * default_margin)) + y1,
          is_vertical ? 'end' : 'middle'
        )
      }
    }
    if (this._config.title) {
      let text
      if (this.axis === 'x') {
        text = new OrangeSVGText(this._config.title, x1 + (x2 - x1) / 2, y2 + 5 * default_margin, 'middle')
        text.args = {'class': 'orange-chart-axis-title'}
      } else {
        const ax = x1 - 6 * default_margin
        const ay = y1 + (y2 - y1) / 2
        text = new OrangeSVGText(this._config.title, ax, ay, 'middle')
        text.args = {'class': 'orange-chart-axis-title', 'transform': `rotate(-90 ${ax},${ay})`}
      }
      svg.appendChild(text)
    }
  }

}

module.exports = OrangeChartAxis