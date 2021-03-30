const {OrangeSVGPath} = require('orange-svg')

/**
 * Class implements sector of the circle (for pie-chart)
 */
class OrangeSVGCircularSector extends OrangeSVGPath {

  /**
   * Calculates position of the dot on the circle's radius based on percentage
   *
   * @param {number} value Percent
   * @param {number} radius Circle radius
   * @return {[number, number]} x,y
   * @static
   */
  static calculateCoordinates (value, radius) {
    return [Math.cos(2 * Math.PI * value) * radius, Math.sin(2 * Math.PI * value) * radius]
  }

  /**
   *
   * @param {number} start_value Percentage of the sector's beginning
   * @param {number} added_value Percentage of the circle for the sector
   * @param {number} radius Circle radius
   * @param {?string} color
   * @param {number=0} center_x Circle center X
   * @param {number=0} center_y Circle center Y
   */
  constructor (start_value, added_value, radius, color = null, center_x = 0, center_y = 0) {
    const sc = OrangeSVGCircularSector.calculateCoordinates(start_value, radius)
    sc[0] += center_x
    sc[1] += center_y
    const end_value = start_value + added_value
    const cc = OrangeSVGCircularSector.calculateCoordinates(end_value, radius)
    cc[0] += center_x
    cc[1] += center_y
    const more_than_half = added_value > 0.5
    super(`M ${sc.join(' ')} A ${radius} ${radius} 0 ${more_than_half ? 1 : 0} 1 ${cc.join(' ')} L ${center_x} ${center_y}`, color)
  }

}

module.exports = OrangeSVGCircularSector
