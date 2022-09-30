# Orange.Charts

Simple light library for creating SVG (vector) charts both server-client and client-side.

Library provides functionality for line charts, bar charts, pie charts, etc.

## Example

This is example of the bar (column) chart:

```javascript
const data_elections_history_popular_vote = [
    {'year': '1996', 'republicans': 39197469, 'democrats': 47401185},
    {'year': '2000', 'republicans': 50456002, 'democrats': 50999897},
    {'year': '2004', 'republicans': 62040610, 'democrats': 59028444},
    {'year': '2008', 'republicans': 59948323, 'democrats': 69498516},
    {'year': '2012', 'republicans': 60933504, 'democrats': 65915795},
    {'year': '2016', 'republicans': 62984828, 'democrats': 65844610},
    {'year': '2020', 'republicans': 74216747, 'democrats': 81268867}
]; // Data set
(new OrangeChartBars(data_elections_history_popular_vote))
    .assignSource("republicans", "#ff1a1a") // Assign first source (columns will be red) - property "republicans" from the data set
    .assignSource("democrats", "#2e4de5") // Assign second source (columns will be blue) - property "democrats" from the data set
    .axis("x", { // Description of X axis
        "label": true, // Show label for X axis values
        "title": "Elections year", // Title of the axis
        "source": "year" // "year" property will be used as data for X axis,
    })
    .axis("y", { // Description of Y axis
        "min": 0, // Minimal value (without definition it would be calculated automatically
        "max": 160000000, // Maximal value (without definition it would be calculated automatically
        "lines": true, // Render horizontal (for Y axis) lines
        "label": v => `${v / 1000000}M` // Show labels processed via this callback
    })
    .render("bars_chart_cumulative", { // Render chart in object with ID "bars_chart_cumulative"
        "width": 768, "height": 384 // Dimensions of the SVG file
    });
```

See [examples](./example/index.html) file for more examples.

## Classes

### OrangeChartAbstract

Abstract chart. Can be used for extending this library.

Methods and properties of this class appear in any type of chart.

| Element | Name | Type | Description |
|---|---|---|---|
| method | `constructor` |  | Creates chart. Data set (array of objects) should be provided as argument |
| abstract static readonly property | `allowed_axes` | `string[]` | List of axes allowed for the chart (overridden for each type of chart) |
| static readonly property | `source_axis` | `string` | Name of axis for dynamic data ("y" by default) |
| abstract static readonly property | `chart_type_code` | `string` | Name of chart type |
| method | `assignSource` | `this` | Assigns property of data set's objects to be used for source axis |
| method | `setDataCallback` | `this` | Defines default JavaScript callbacks for elements created for representation of the value |
| method | `getCallbacks` | `this` | Returns callback by property name (default if custom were not defined via OrangeChartAbstract.assignSource |
| method | `axis` | `this` | Defines axis configuration. See below details about second argument of the function |
| method | `render` | `SVGSVGElement` | Renders chart |
| method | `toString` | `string` | Converts chart to SVG string |

### Different types of charts

* `OrangeChartBars` - vertical bars (columns) chart
* `OrangeChartDots` - chart with dots positioned by x and y coordinates (z-value can be used for different diameter of the dots)
* `OrangeChartHorizontalBars` - horizontal bars chart
* `OrangeChartLines` - lines chart
* `OrangeChartPie` - pie chart

#### Special functionality

##### `OrangeChartDots`

You can define function to calculate color of dots:

```
...
    .assignSource("param", row => {
        return Math.random() >= 0.5 ? '#00ff00' : '#ff0000'
    })
...
```

### Other classes

They can be used for extending this library.

* `OrangeChartAxis` - represents axis of the chart
* `OrangeChartAbstractBars` - abstract bar chart
* `OrangeChartAbstractGrid` - abstract "grid"-type chart (with two axes and set of values to be shown on the "grid")

## Config arguments

### `config`: OrangeChartAbstract.axis(*, config)

Config is supposed to be an object with these possible properties. Some values may not be used for some types of charts. Default values may vary as well.

| Name | Type | Description |
|---|---|---|
| `sources` | `string[]` | list of properties to be used as data source for the axis |
| `sources` | `string` | one property to be used as data source for the axis |
| `dynamic` | `boolean` | defines if data for this axis dynamic or serial |
| `cumulative` | `boolean` | defines if data from multiple sources should be summarized |
| `label` | `boolean`, `function` | defines if label should be rendered (if function is provided it will be used to process value for each label) |
| `lines` | `boolean` | defines if lines (horizontal for "y" axis, vertical for "x" axis) should be rendered on the background |
| `min` | `number` | minimal value of the axis |
| `max` | `number` | maximal value of the axis |

### `view`: OrangeChartAbstract.render(*, view), OrangeChartAbstract.toString(view)

This config defines some configuration for chart's rendering. Certain properties can be uses for certain chart types.

| Name | Type | Description | Chart types |
|---|---|---|---|
| `width` | `number` | Chart's width (in pixels) | All |
| `height` | `number` | Chart's height (in pixels) | All |
| `default_margin` | `number` | Default margin for the chart's elements (in pixels) | All |
| `line_color` | `string` | Color of the line in the grid | All with axes |
| `line_thickness` | `number` | Thickness of the line in the grid | All with axes |
| `diameter` | `number` | Chart's diameter (in pixels) - can be used instead of `width` and `height` | `OrangeChartPie` |
| `label` | `boolean` or `number` | Defines if labels for the pie chart's elements should be rendered (if number is provided it is being used as minimal percent of the pie's sector for having a label) | `OrangeChartPie` |
| `bar_size` | `number` | Size of the bar (in pixels) - can be used instead of `width` / `height` | `OrangeChartBars`, `OrangeChartHorizontalBars` |
| `fair` | `boolean` | Use `true` if you want mathematically correct SVG files (in other case some values can be slightly adjusted for minimizing rendering issues) | `OrangeChartBars`, `OrangeChartHorizontalBars` |
| `radius` | `boolean` | Fixed dot radius | `OrangeChartDots` |
| `dots` | `boolean` | Defines if dots should be rendered on the chart's line | `OrangeChartLines` |
| `min_radius` | `number` | Minimal dot radius (dynamic mode) | `OrangeChartDots`, `OrangeChartLines` |
| `max_radius` | `number` | Maximal dot radius (dynamic mode) | `OrangeChartDots`, `OrangeChartLines` |
| `median_line` | `number` | Provide value (number of chunks to split data) to show line based on median value of data chunk | `OrangeChartDots`, `OrangeChartLines` |
| `median_line_color` | `string` | Defines color of median values line | `OrangeChartDots` |
| `average_line` | `number` | Provide value (number of chunks to split data) to show line based on average value of data chunk | `OrangeChartDots`, `OrangeChartLines` |
| `average_line_color` | `string` | Defines color of average values line | `OrangeChartDots` |
| `area` | `boolean` | Defines if area below the line should be filled with the color | `OrangeChartLines` |
| `area_opacity` | `number` | Defines opacity of the area below the line | `OrangeChartLines` |
| `average_lines` | `object` | Enables lines with average line per property | `OrangeChartDots`, `OrangeChartLines`, `OrangeChartBars`, `OrangeChartHorizontalBars` |
| `average_lines:key` | `string` | Data property name |  |
| `average_lines:value` | `string` | Line for data property line's color |  |
| `all_average_line` | `boolean` or `string` | Enables line with average line (all properties); defines line's color | `OrangeChartDots`, `OrangeChartLines`, `OrangeChartBars`, `OrangeChartHorizontalBars` |

## Logarithmic chart

For some charts, such as `OrangeChartBars`, `OrangeChartLines` and `OrangeChartDots`, you can define logarithmic mode.

To do so, it should by in dynamic mode for Y axis (works that way by default for `Y` axis in such charts) and provide `log: true` option:

```
    ...
    .axis("y", {
      "label": true,
      "log": true
    })
    ...
```

Please, pay attention that right now "average lines" functionality doesn't work correctly with logarithmic mode.
