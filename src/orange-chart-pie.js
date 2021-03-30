const {OrangeColor} = require('orange-colors')
const {OrangeSVGLine, OrangeSVGCircle, OrangeSVGText} = require('orange-svg')
const OrangeChartAbstract = require('./orange-chart-abstract')
const OrangeSVGCircularSector = require('./orange-svg-circular-sector')

class OrangeChartPie extends OrangeChartAbstract {

  /**
   * Chart type
   *
   * @type {string}
   * @static
   */
  static get chart_type_code () {
    return 'pie'
  }

  /**
   * Returns allowed axes for the chart
   *
   * @type {string[]}
   * @static
   */
  static get allowed_axes () {
    return []
  }

  /**
   * Next default color to be used for chart's sector (72 different colors are supported)
   *
   * @type {string}
   */
  get next_color () {
    if (!this._color) {
      this._color = new OrangeColor('e50000')
    } else {
      this._color.h += 85
    }
    return `#${this._color.hex_string}`
  }

  /**
   * Basic dimensions of the chart
   *
   * @param {object} view
   * @return {{width:number, height:number}}
   * @protected
   */
  _get_basic_dimensions (view) {
    const diameter = view.hasOwnProperty('diameter') ? view.diameter : 100
    const width = view.hasOwnProperty('width') ? view.width : (view.hasOwnProperty('label') && (view.label !== false) ? 2 * diameter : diameter)
    const height = view.hasOwnProperty('height') ? view.height : diameter
    return {width, height}
  }

  /**
   * Label lines color
   *
   * @type {string}
   */
  static get COLOR () {
    return this._color || 'rgba(127,127,127,0.2)'
  }

  /**
   * Label lines color
   *
   * @type {string}
   */
  static set COLOR (value) {
    this._color = value
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
    const width = x2 - x1
    const height = y2 - y1
    const diameter = view.hasOwnProperty('diameter') ? view.diameter : Math.min(width, height)
    const radius = diameter / 2
    const default_margin = view.hasOwnProperty('default_margin') ? view.default_margin : 10
    const label_line_color = view.hasOwnProperty('label_line_color') ? view.label_line_color : this.constructor.COLOR

    let total, colors, value, rendering_value, shown, cc, is_right, l
    for (let pie of Object.values(this._source_mapping)) { // TODO Real support of multiple charts
      shown = 0
      colors = pie.hasOwnProperty('color') ? pie.color : {}
      total = this._data.map(v => v[pie.property]).reduce((a, c) => a + c, 0)
      const callbacks = this.getCallbacks(pie.property)
      for (const row of this._data) {
        const color = colors && colors.property && colors.mapping && colors.mapping.hasOwnProperty(row[colors.property]) ? colors.mapping[row[colors.property]] : this.next_color
        value = row[pie.property]
        rendering_value = view.fair ? value : Math.min(value + 0.01 * total, total - shown)
        const callback_data = {value, 'property': pie.property, 'label': row[colors.property]}
        const sector = total === rendering_value
          ? new OrangeSVGCircle(x1 + width / 2, y1 + height / 2, radius, color)
          : new OrangeSVGCircularSector(shown / total, rendering_value / total, radius, color, x1 + width / 2, y1 + height / 2)
        sector.args = {'data-property': row[colors.property], 'class': 'orange-chart-pie-slice'}
        svg.appendChild(sector, callbacks, callback_data)
        if (view.hasOwnProperty('label') && (view.label !== false) && ((view.label === true) || (value / total * 100 > view.label))) {
          cc = OrangeSVGCircularSector.calculateCoordinates((shown + value / 2) / total, radius)
          is_right = cc[0] < 0
          l = {'x1': x1 + width / 2, 'y': cc[1] + y1 + height / 2}
          l.x2 = is_right ? l.x1 - radius - 2 * default_margin : l.x1 + radius + 2 * default_margin
          l.x1 = is_right ? l.x1 + cc[0] : l.x1 + cc[0];
          const line = new OrangeSVGLine(l.x1, l.y, l.x2, l.y, label_line_color, null)
          line.args = {'class': `orange-chart-scale orange-chart-pie-line`}
          svg.appendChild(line)
          const text = new OrangeSVGText(row[colors.property], is_right ? l.x2 - default_margin : l.x2 + default_margin, l.y + default_margin * 0.55, is_right ? 'end' : 'start')
          text.args = {'class': 'orange-chart-label'}
          svg.appendChild(text)
        }
        shown += value
      }
    }

  }

}

module.exports = OrangeChartPie
