const {OrangeSVGRect} = require('orange-svg')
const OrangeChartAbstractXY = require('./orange-chart-abstract-x-y')

class OrangeChartAbstractBars extends OrangeChartAbstractXY {

  /**
   * Chart type
   *
   * @type {string}
   * @static
   */
  static get chart_type_code () {
    return 'bars'
  }

  /**
   * @abstract
   * @return string
   */
  get chart_sub_type_code () {
    throw new Error('OrangeChartAbstractBars.chart_sub_type_code should be overridden')
  }

  /**
   * Returns chart elements positioning mode
   * @return boolean
   */
  get _is_vertical () {
    return this.chart_sub_type_code === 'vertical'
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
    const bar_size = view.hasOwnProperty('bar_size') ? view.bar_size : 60
    const margin = view.hasOwnProperty('margin') ? view.margin : 20
    const width = view.hasOwnProperty('width') ? view.width : (!this._is_vertical ? (this._data.length * (margin + bar_size) + margin) : 500)
    const height = view.hasOwnProperty('height') ? view.height : (this._is_vertical ? (this._data.length * (margin + bar_size) + margin) : 200)
    return {width, height}
  }

  /**
   *
   * @param {number} total_length
   * @param {object} view
   * @param {boolean=false} has_label
   * @return {{bar_size: number, margin: number, side_margin_adjustment: number}}
   * @protected
   */
  _calculate_data_for_render (total_length, view, has_label = false) {
    let margin = view.hasOwnProperty('margin') ? view.margin : 20
    let bar_size = view.hasOwnProperty('bar_size') ? view.bar_size : 60
    const m_bw_ratio = margin / bar_size
    const side_margin_adjustment = has_label ? 1 : -1
    margin = total_length / (this._data.length + side_margin_adjustment + this._data.length / m_bw_ratio)
    bar_size = margin / m_bw_ratio
    return {bar_size, margin, side_margin_adjustment}
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
    const real_axis = this._is_vertical ? this._axes.y : this._axes.x
    const rd = this._calculate_data_for_render(this.chart_sub_type_code === 'vertical' ? width : height, view, real_axis._config.label)
    const fair = view.hasOwnProperty('fair') ? view.fair : false
    let bar_length, row_cumulative_value
    const real_scale = real_axis.scale
    for (let [i, row] of Object.entries(this._data)) {
      i = parseInt(i)
      const bar_section_length = real_axis.cumulative ? rd.bar_size : (rd.bar_size / this._source_mapping.length)
      row_cumulative_value = 0
      for (let [j, bar] of Object.entries(this._source_mapping)) {
        if (!bar.hasOwnProperty('property')) {
          throw new Error('"property" should be defined for "bar" in properties')
        }
        j = parseInt(j)
        const callbacks = this.getCallbacks(bar.property)
        const callback_data = {
          'property': bar.property,
          'value': row[bar.property]
        }
        const rsv = row[bar.property] - real_scale.min
        const rss = real_scale.max - real_scale.min
        bar_length = this._axes.y._config.dynamic && this._axes.y._config.log
          ? (rsv ? (Math.log(rsv) / Math.log(rss)) : 0) 
          : (rsv / rss)
        bar_length =  bar_length * (this._is_vertical ? height : width)
        const unfair_adjustment = real_axis.cumulative && !fair && j && row_cumulative_value ? Math.min(row_cumulative_value, height * 0.0075) : 0;
        const rectangle = this._is_vertical
          ? (new OrangeSVGRect(
            (rd.margin + rd.bar_size) * i + (real_axis.cumulative ? 0 : bar_section_length * j) + (rd.side_margin_adjustment > 0 ? rd.margin : 0) + x1,
            height - bar_length - row_cumulative_value + y1,
            bar_section_length,
            bar_length + unfair_adjustment,
            bar.color
          ))
          : (new OrangeSVGRect(
            row_cumulative_value + x1,
            (rd.margin + rd.bar_size) * i + (real_axis.cumulative ? 0 : bar_section_length * j) + (rd.side_margin_adjustment > 0 ? rd.margin : 0) + y1,
            bar_length + unfair_adjustment,
            bar_section_length,
            bar.color
          ))
        rectangle.args = {'data-property': bar.property, 'class': `orange-chart-bars-bar, orange-chart-bars-bar-${this.chart_sub_type_code}`}
        svg.appendChild(rectangle, callbacks, callback_data)
        if (real_axis.cumulative) {
          row_cumulative_value += bar_length
        }
      }
    }
  }

}

module.exports = OrangeChartAbstractBars
