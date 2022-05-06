const OrangeChartAbstractXY = require('./orange-chart-abstract-x-y')

class OrangeChartAbstractGrid extends OrangeChartAbstractXY {

  /**
   * Chart type
   *
   * @type {string}
   * @static
   */
  static get chart_type_code () {
    return 'lines'
  }

  /**
   * Returns allowed axes for the chart
   *
   * @type {string[]}
   * @static
   */
  static get allowed_axes () {
    return ['x', 'y']
  }

  /**
   * Basic dimensions of the chart
   *
   * @param {object} view
   * @return {{width:number, height:number}}
   * @protected
   */
  _get_basic_dimensions (view) {
    const margin = view.hasOwnProperty('margin') ? view.margin : (view.hasOwnProperty('width') ? view.width / (this._data.length - 1) : 10)
    const width = margin * (this._data.length - 1)
    const height = view.hasOwnProperty('height') ? view.height : 100
    return {width, height}
  }

  /**
   * Renders chart's elements
   *
   * @abstract
   * @protected
   */
  _do_render_elements () {
    throw new Error('_do_render_elements should be overridden')
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
   * @protected
   */
  _do_render (svg, view, x1, y1, x2, y2) {
    super._do_render(svg, view, x1, y1, x2, y2)

    const width = x2 - x1
    const height = y2 - y1
    const margin = width / (this._data.length - 1)

    let position_w, position_h, radius, min_radius, max_radius, base_radius, h_position_property

    if (this._axes.hasOwnProperty('z')) {
      base_radius = view.hasOwnProperty('radius') ? view.radius : 2
      min_radius = view.hasOwnProperty('min_radius') ? view.min_radius : base_radius
      max_radius = view.hasOwnProperty('max_radius') ? view.max_radius : (10 * base_radius)
    }

    const x_scale = this._axes.x.scale
    const y_scale = this._axes.y.scale
    const z_scale = this._axes.z ? this._axes.z.scale : null

    let elements

    for (let line of this._source_mapping) {
      if (!line.hasOwnProperty('property')) {
        throw new Error('"property" should be defined for "line" in properties')
      }
      elements = []
      for (let [i, row] of Object.entries(this._data)) {
        i = parseInt(i)
        position_w = this._axes.x.dynamic
          ? (row[this._axes.x.source] - x_scale.min) / (x_scale.max - x_scale.min) * width
          : (margin * i)
        if (z_scale && this._axes.z.dynamic) {
          radius = (row[this._axes.z.source] - z_scale.min) / (z_scale.max - z_scale.min) * (max_radius - min_radius) + min_radius
          h_position_property = this._axes.y.source
        } else {
          h_position_property = line.property
        }
        position_h = height - (row[h_position_property] - y_scale.min) / (y_scale.max - y_scale.min) * height
        position_w += x1
        position_h += y1
        elements.push([
          position_w,
          position_h,
          radius || base_radius || null,
          row
        ])
      }
      this._do_render_elements(svg, elements, line.hasOwnProperty('color') ? line.color : null, line.property, view, {x1, y1, x2, y2})
    }
  }

}

module.exports = OrangeChartAbstractGrid
