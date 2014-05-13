
//
// ### function querystring()
// Returns a parsed querystring using a __very__
// naive parsing method.
//
function querystring() {
  return location.search.substring(1).split("&")
    .reduce(function (params, value) {
      parts = value.split('=');
      params[parts[0]] = parts[1];
      return params;
    }, {});
}

var params      = querystring(),
    packageName = params.p || 'winston';

//
// ### function codependencyGraph (codeps)
// Draws the codependency graph based on the overall size
// of the relationship.
//
function codependencyGraph(codeps) {
  var width       = (window.innerWidth / 2) - (window.innerWidth / 20),
      height      = width * 0.85,
      outerRadius = height / 2,
      innerRadius = outerRadius - 45,
      matrix      = codeps.matrix,
      values      = codeps.values,
      names       = codeps.names,
      pkg         = codeps.name,
      totals;

  // var fill = d3.scale.category10();
  var colorbrewer = ['rgb(139,214,254)','rgb(32,120,238)','rgb(123,250,130)','rgb(51,160,44)','rgb(251,160,206)','rgb(227,26,28)','rgb(252,233,61)','rgb(255,127,0)','rgb(202,178,230)','rgb(106,61,154)'];
  var fill = d3.scale.ordinal().range(colorbrewer);

  var fmt = {
    percent: d3.format('.2%'),
    decimal: d3.format(',.2f'),
    integer: d3.format('n')
  }

  var chord = d3.layout.chord()
    .padding(.08)
    .sortSubgroups(d3.descending)
    .sortChords(d3.descending);

  var arc = d3.svg.arc()
    .innerRadius(innerRadius)
    .outerRadius(innerRadius + 20);

  var container = d3.select('#codependencies')
    .append('article')
      .attr('id', codeps.type);

  var svg = container
    .append("svg")
      .attr("width", width)
      .attr("height", height)
    .append("svg:g")
      .attr("id", "circle")
      .attr("transform", "translate(" + ((width / 2) + (width / 20)) + "," + height / 2 + ")");

  svg.append("circle")
    .attr("r", innerRadius + 20);

  var graph = svg.append("g")
    .attr("transform", "translate(" + outerRadius * 1.25 + "," + outerRadius + ")");

  document.getElementById("package-name").innerHTML = pkg;
  chord.matrix(matrix);

  //
  // Compute all the totals for
  // all packages
  //
  totals = values.map(function (arr) {
    return arr.reduce(function (sum, val) {
      return sum + val;
    }, 0);
  });

  //
  // ### function chordTip (d, i)
  // Returns the text for the chord tooltip
  //
  function chordTip (d, i) {
    var source = d.source.index,
        target = d.target.index;

    return [
      '<table>',
      '  <thead>',
      '    <tr>',
      '      <td></td>',
      '      <td>Raw</td>',
      '      <td>Weighted</td>',
      '      <td>Total</td>',
      '    </tr>',
      '  </thead>',
      '  <tbody>',
      '    <tr>',
      '      <td>' + names[source] + '</td>',
      '      <td>' + fmt.integer(values[source][target]) + '</td>',
      '      <td>' + fmt.decimal(matrix[source][target]) + '%</td>',
      '      <td>' + fmt.integer(totals[source]) + '</td>',
      '    </tr>',
      '    <tr>',
      '      <td>' + names[target] + '</td>',
      '      <td>' + fmt.integer(values[target][source]) + '</td>',
      '      <td>' + fmt.decimal(matrix[target][source]) + '%</td>',
      '      <td>' + fmt.integer(totals[target]) + '</td>',
      '    </tr>',
      '  </tbody>',
      '</table>'
    ].join('\n');
  }

  //
  // ### function cMouseover (d, i)
  // Mouse enter handler for individual chords
  //
  function cMouseover(d, i) {
    d3.select("#tooltip")
      .style("visibility", "visible")
      .html(chordTip(d, i))
      .style("top", function () { return (d3.event.pageY - 100)+"px"})
      .style("left", function () { return (d3.event.pageX - 100)+"px";})
  };

  // //
  // // ### function groupTip (d, i)
  // // Returns the text for the group tooltip
  // //
  // function groupTip (d) {
  //   var name    = names[d.index],
  //       source  = d.index,
  //       headers = [],
  //       rows    = [];

  //   return [
  //     '<table>',
  //     '  <thead>',
  //     '    <tr>',
  //   ].concat(headers).concat([
  //     '    </tr>',
  //     '  </thead>',
  //     '  <tbody>'
  //   ]).concat(rows).concat([
  //     '  </tbody>',
  //     '</table>'
  //   ]).join('\n');
  // }

  //
  // ### function cMouseover (d, i)
  // Mouse enter handler for individual groups (i.e. packages)
  //
  function gMouseover(d, i) {
    // d3.select("#tooltip")
    //   .style("visibility", "visible")
    //   .html(groupTip(d))
    //   .style("top", function () { return (d3.event.pageY - 80)+"px"})
    //   .style("left", function () { return (d3.event.pageX - 130)+"px";});

    chordPaths.classed("fade", function(p) {
      return p.source.index != i
          && p.target.index != i;
    });
  }

  //
  // Hides the tooltip overlay
  //
  function hide() {
    d3.select("#tooltip").style("visibility", "hidden");
  }

  //
  // Create arcs representing the codependent
  // package relationships
  //
  var g = svg.selectAll("g.group")
      .data(chord.groups())
    .enter().append("svg:g")
      .attr("class", "group")
      .style("fill", function(d) { return fill(d.index); })
      .style("stroke", function(d) { d3.rgb(fill(d.index)).darker() })
      .on("mouseover", gMouseover);
      // .on("mouseout", hide);

  g.append("svg:path")
    .style("fill", function(d) { return fill(d.index); })
    .attr("d", arc);

  //
  // Set outer package labels
  //
  g.append("svg:text")
    .each(function(d) { d.angle = (d.startAngle + d.endAngle) / 2; })
      .attr("dy", ".35em")
      .attr("text-anchor", function(d) { return d.angle > Math.PI ? "end" : null; })
      .attr("transform", function(d) {
        return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")"
          + "translate(" + (innerRadius + 26) + ")"
          + (d.angle > Math.PI ? "rotate(180)" : "");
      })
      .text(function(d) { return names[d.index]; });

  //
  // Create chords
  //
  var chordPaths = svg.selectAll("path.chord")
      .data(chord.chords())
    .enter().append("svg:path")
      .attr("class", "chord")
      .style("stroke", function(d) { return d3.rgb(fill(d.source.index)).darker(); })
      .style("fill", function(d) { return fill(d.source.index); })
      .attr("d", d3.svg.chord().radius(innerRadius))
      .on("mouseover", cMouseover)
      .on("mouseout", hide);

  d3.select(window.frameElement).style("height", outerRadius * 2 + "px");

  //
  // Append the <h3> representing the subtitle of this diagram.
  //
  container.append('h3')
    .text(codeps.type + ': '
      + codeps.lattice.total.subset + ' of ' + codeps.lattice.total.absolute)
}

//
// Download the JSON itself and calculate the relative widths
// based on the totals.
//
d3.json("json/codeps/" + packageName + '.json', function(error, display) {
  ['dependencies', 'devDependencies'].forEach(function (type) {
    display[type].name = packageName;
    display[type].type = type;
    codependencyGraph(display[type]);
  });
});