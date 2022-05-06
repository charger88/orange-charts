const OrangeChartAbstractGrid = require('./orange-chart-abstract-grid')
const {OrangeSVGCircle} = require('orange-svg')

class OrangeChartDots extends OrangeChartAbstractGrid {

  /**
   * Returns allowed axes for the chart
   *
   * @type {string[]}
   * @static
   */
  static get allowed_axes () {
    return ['x', 'y', 'z']
  }

  /**
   *
   * @param {OrangeSVG} svg
   * @param {[number, number, number][]} data
   * @param {string} color
   * @param {string} property
   * @param {object} view
   * @param _
   * @protected
   */
  _do_render_elements (svg, data, color, property, view, _) {
    const callbacks = this.getCallbacks(property)
    let i = 0
      for (const [x, y, radius, row] of data) {
      const circle = new OrangeSVGCircle(x, y, radius, color)
      circle.args = {'data-property': property || '', 'class': 'orange-chart-dots-dot'}
      svg.appendChild(circle, callbacks, {property, row, 'value': {'x': this._data[i][this._axes['x'].source], 'y': this._data[i][property]}})
      ++i
    }
  }

}

module.exports = OrangeChartDots
