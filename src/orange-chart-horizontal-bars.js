const OrangeChartAbstractBars = require('./orange-chart-abstract-bars')

class OrangeChartHorizontalBars extends OrangeChartAbstractBars {

  /**
   * Chart subtype
   *
   * @type {string}
   * @static
   */
  get chart_sub_type_code () {
    return 'horizontal'
  }

  /**
   * Axis with dynamic values
   *
   * @type {string}
   * @static
   */
  static get source_axis () {
    return 'x'
  }

  /**
   * Function for calculating label position for labels on Y axis
   *
   * @type {null|{function(number, number, object): number}}
   * @protected
   */
  get _y_axis_label_position_function () {
    return (i, size, view) => {
      const rd = this._calculate_data_for_render(size, view, this._axes.y._config.label)
      return (rd.margin + rd.bar_size) * i + rd.bar_size * 0.5 + (rd.side_margin_adjustment > 0 ? rd.margin : 0)
    }
  }

}

module.exports = OrangeChartHorizontalBars
