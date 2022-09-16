const OrangeChartAbstractGrid = require('./orange-chart-abstract-grid')
const {OrangeSVGCircle, OrangeSVGPolyline} = require('orange-svg')

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
   * @param {string|function} color
   * @param {string} property
   * @param {object} view
   * @param _
   * @protected
   */
  _do_render_elements (svg, data, color, property, view, _) {
    if (view.median_line) {
      this._do_render_median_line(svg, data, view.median_line, view.median_line_color  || '#808080')
    }
    if (view.average_line) {
      this._do_render_average_line(svg, data, view.average_line, view.average_line_color  || '#808080')
    }
    const callbacks = this.getCallbacks(property)
    let i = 0
    for (const [x, y, radius, row] of data) {
      const circle = new OrangeSVGCircle(x, y, radius, typeof color === 'function' ? color(row) : color)
      circle.args = {'data-property': property || '', 'class': 'orange-chart-dots-dot'}
      svg.appendChild(circle, callbacks, {property, row, 'value': {'x': this._data[i][this._axes['x'].source], 'y': this._data[i][property]}})
      ++i
    }
  }

  /**
   * Returns data 
   * @param {[number, number, number][]} data
   * @param {number} chunks_number Number of chunks
   */
  _get_data_chunks(data, chunks_number) {
    const groups = []
	  const elements_by_group = data.length / chunks_number
	  for (let i = 0; i < data.length; i++) {
		  const gn = Math.floor(i / elements_by_group)
		  if (!groups[gn]) {
			  groups[gn] = []
		  }
		  groups[gn].push(data[i])
	  }
    return groups
  }
  
  /**
   * Renders median line
   * @param {OrangeSVG} svg
   * @param {[number, number, number][]} data
   * @param {number} line_chunks Number of median line's points 
   * @param {string} line_color 
   */
   _do_render_median_line (svg, data, line_chunks, line_color) {
	  const xy = data.sort((a,b) => a[0] - b[0]).map(v => ({x: v[0], y: v[1]}))
	  const groups = this._get_data_chunks(xy, line_chunks)
    const points = []
	  for (const group of groups) {
      const median_i = (group.length - 1) / 2
      const x = (group[Math.floor(median_i)].x + group[Math.ceil(median_i)].x) / 2
      const group_y = group.sort((a,b) => a.y - b.y)
      const y = (group_y[Math.floor(median_i)].y + group_y[Math.ceil(median_i)].y) / 2
      points.push([x, y])
    }
    const line = new OrangeSVGPolyline(points, line_color)
    line.args = {'class': `orange-chart-median`}
    svg.appendChild(line)
  }
  
  /**
   * Renders average line
   * @param {OrangeSVG} svg
   * @param {[number, number, number][]} data
   * @param {number} line_chunks Number of median line's points 
   * @param {string} line_color 
   */
   _do_render_average_line (svg, data, line_chunks, line_color) {
	  const xy = data.sort((a,b) => a[0] - b[0]).map(v => ({x: v[0], y: v[1]}))
    const groups = this._get_data_chunks(xy, line_chunks)
    const points = []
	  for (const group of groups) {
      const x = group.reduce((a,c) => a + c.x, 0) / group.length
      const y = group.reduce((a,c) => a + c.y, 0) / group.length
      points.push([x, y])
    }
    const line = new OrangeSVGPolyline(points, line_color)
    line.args = {'class': `orange-chart-average`}
    svg.appendChild(line)
  }

}

module.exports = OrangeChartDots
