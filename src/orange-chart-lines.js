const OrangeChartAbstractGrid = require('./orange-chart-abstract-grid')
const {OrangeSVGPolyline, OrangeSVGPolygon, OrangeSVGCircle} = require('orange-svg')

class OrangeChartLines extends OrangeChartAbstractGrid {

  /**
   *
   * @param {OrangeSVG} svg
   * @param {[number, number, number][]} data
   * @param {string} color
   * @param {string} property
   * @param {object} view
   * @param {{y2: number}} position
   * @protected
   */
  _do_render_elements (svg, data, color, property, view, position) {
    let area_opacity = view.hasOwnProperty('area') && (view.area === true || view.area.includes(property))
      ? (view.hasOwnProperty('area_opacity') ? view.area_opacity : 0.5)
      : null
    const callbacks = this.getCallbacks(property)
    if (area_opacity !== 1) {
      const line = new OrangeSVGPolyline(data, color, view.hasOwnProperty('area_opacity') ? view.area_opacity : null)
      line.args = {'data-property': property, 'class': 'orange-chart-lines-line'}
      svg.appendChild(line)
    }
    if (area_opacity !== null) {
      const polygon = new OrangeSVGPolygon(data.concat([[data[data.length - 1][0], position.y2], [data[0][0], position.y2]]), color, area_opacity)
      polygon.args = {'data-property': property, 'class': 'orange-chart-lines-area'}
      svg.appendChild(polygon)
    }
    if (view.hasOwnProperty('dots') && (view.dots === true || view.dots.includes(property))) {
      let i = 0
      for (const [x, y] of data) {
        const circle = new OrangeSVGCircle(x, y, view.hasOwnProperty('radius') ? view.radius : 2, color)
        circle.args = {'data-property': property, 'class': 'orange-chart-lines-dot'}
        svg.appendChild(circle, callbacks, {property, 'value': {'x': this._data[i][this._axes['x'].source], 'y': this._data[i][property]}})
        ++i
      }
    }

  }

}

module.exports = OrangeChartLines
