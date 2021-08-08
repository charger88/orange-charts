const {OrangeSVGLine} = require('orange-svg')
const OrangeChartAbstract = require('./orange-chart-abstract')

/**
 * Abstract chart with X and Y axes
 *
 * @abstract
 */
class OrangeChartAbstractXY extends OrangeChartAbstract {

  /**
   * Returns chart elements positioning mode
   * @return boolean
   */
  _is_vertical () {
    return true;
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
    this._renderAverageLines(svg, view, x1, y1, x2, y2)
  }

  /**
   * Renders lines with average values
   *
   * @param {OrangeSVG} svg
   * @param {object} view
   * @param {number} x1
   * @param {number} y1
   * @param {number} x2
   * @param {number} y2
   * @protected
   */
  _renderAverageLines (svg, view, x1, y1, x2, y2) {
    const width = x2 - x1
    const height = y2 - y1
    const real_axis = this._is_vertical ? this._axes.y : this._axes.x
    const real_scale = real_axis.scale
    if (view.average_lines || view.all_average_line) {
      const average_lines_values = {};
      if (view.all_average_line) {
        average_lines_values['@all_average'] = [];
      }
      for (let row of Object.values(this._data)) {
        for (let element of Object.values(this._source_mapping)) {
          if (!element.hasOwnProperty('property')) {
            throw new Error('"property" should be defined for "element" in properties')
          }
          if (view.average_lines) {
            if (!average_lines_values.hasOwnProperty(element.property)) {
              average_lines_values[element.property] = [];
            }
            average_lines_values[element.property].push(row[element.property]);
          }
          if (view.all_average_line) {
            average_lines_values['@all_average'].push(row[element.property]);
          }
        }
      }
      for (let [property_name, property_values] of Object.entries(average_lines_values)) {
        const v = (property_values.reduce((a, b) => a + b) / property_values.length - real_scale.min) / (real_scale.max - real_scale.min) * (this._is_vertical ? height : width);
        const average_line_color = property_name === '@all_average'
          ? typeof view.all_average_line !== 'boolean' ? view.all_average_line : null
          : typeof view.average_lines === 'object' && view.average_lines[property_name] ? view.average_lines[property_name] : null;
        const average_line = this._is_vertical
          ? (new OrangeSVGLine(x1, height - v + y1, x2, height - v + y1, average_line_color))
          : (new OrangeSVGLine(width - v + x1, y1, width - v + x2, y1, average_line_color))
        average_line.args = {'data-property': property_name, 'class': `orange-chart-average-line`}
        svg.appendChild(average_line)
      }
    }
  }

}

module.exports = OrangeChartAbstractXY
