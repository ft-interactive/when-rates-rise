function ordinalAxis(){
	var scale,
		tickSize = 10,
		tickOffset = 10,
		tickPadding = 25,
		orient = 'bottom',
		margins = {top:0,left:0,bottom:0,right:0};

	function axis(g){
		g.selectAll('g.ordinal-axis')
			.data([1])
			.enter().append('g')
				.attr('class','ordinal-axis');

		var group = g.select('.ordinal-axis')
		group.attr('transform', 'translate(' + margins.left + ',' + margins.top + ')')

		var dataJoin = group.selectAll('.ordinal-tick')
			.data( scale.domain() )
			

		var newTicks = dataJoin
			.enter()
				.append('g')
					.attr({
						'class':'ordinal-tick'
					});
			

		newTicks.append('line').attr('class','ordinal-line');
		newTicks.append('text').attr('class','ordinal-label');

		group.selectAll('.ordinal-tick')
			.attr({
				'transform':function(d){
					return 'translate(' + scale(d) + ', 0)';
				}
			});

		group.selectAll('.ordinal-tick .ordinal-label')
			.attr('transform','translate(0,'+tickPadding+')')
			.text(function(d){ return d; });

		group.selectAll('.ordinal-tick .ordinal-line')
			.attr({
				x1:0,
				x2:0,
				y1:0,
				y2:-tickSize
			});
	}

	axis.tickSize = function(s){
		tickSize = s;
		return axis;
	}

	axis.scale = function (s){
		scale = s;
		return axis;
	}

	axis.margins = function(m){
		margins = m;
		return axis;
	}

	return axis;
}

function dotPlot(){
	var  xScale = d3.scale.ordinal(),
		yScale = d3.scale.linear(),
		margins = {top:20, left:0, bottom:30, right:30 },
		data = [];

	function chart(g){

		var bounds = g.node().getBoundingClientRect(),
			plotWidth = bounds.width - (margins.left + margins.right),
			plotHeight = bounds.height - (margins.top + margins.bottom),

			xScale = d3.scale.ordinal()
				.domain( data.map(function(d){ return d.year }) )
				.rangeBands( [0, plotWidth] ),

			yScale = d3.scale.linear()
				.domain( [0, d3.max(data, function(d){ return d.range[1]}) ] )
				.range( [plotHeight, 0] )
				.nice();

//AXES... 
		var yAxis = d3.svg.axis()
			.tickSize( plotWidth )
			.ticks( 5 )
			.tickPadding( 10 )
			.orient( 'right' )
			.scale( yScale );

		var xAxis = ordinalAxis()
			.scale( xScale )
			.margins( {top:plotHeight+margins.top, left:margins.left} )
			.tickSize( plotHeight );

		g.selectAll('.y.axis')
			.data([1])
			.enter()
				.append('g')
				.attr('class','y axis')

		g.select('.y.axis')
			.attr('transform','translate('+margins.left+', ' + margins.top + ')')
			.call(yAxis);

		g.call(xAxis)
			.attr('transform','translate('+margins.left+',' + plotHeight + ')')
			.selectAll('text')
				.attr('dy','');
//MEDIANS
		
		g.selectAll('.median-indicators')
			.data([1])
			.enter().append('g')
				.attr({
					'class':'median-indicators',
					'transform':'translate('+margins.left+','+margins.top+')'
				});
		
		var mediansEnter = g.select('.median-indicators')
			.selectAll('g')
			.data(data)
				.enter().append('g');

		mediansEnter.append('line')
			.attr('class','median-line');

		mediansEnter.append('text')
			.attr('class','median-label');

		g.selectAll('.median-label')
			.attr({
				'transform':function(d){
					return 'translate('+(xScale(d.year) + xScale.rangeBand() - 3)+','+(yScale(d.median) - 3)+')';
				},
				'text-anchor':'end'
			})
			.text(function(d){
				return d.median + '%';
			});

		g.selectAll('.median-line')
			.attr({
				x1:function(d){
					return xScale(d.year);
				},
				y1:function(d){ return Math.round(yScale(d.median)); },
				x2:function(d){
					return xScale(d.year) + xScale.rangeBand();
				},
				y2:function(d){ return Math.round(yScale(d.median)); }
			});

//THE ACTUAL DOTS
		g.selectAll('.data-points')
			.data([1])
			.enter().append('g').attr({
				'class':'data-points',
				'transform':'translate('+margins.left+','+margins.top+')'
			});

		g.select('.data-points')
			.selectAll('g.set').data(data)
				.enter().append('g').attr('class','set')

		g.selectAll('.set')
			.attr({
				'transform':function(d){ return 'translate('+xScale(d.year)+',0)'; }
			}).each(voteDistribution);

		function voteDistribution(data){
			var parent = d3.select(this);

			parent.selectAll('g.vote-group')
				.data(data.votes)
					.enter()
				.append('g')
					.attr({
						'class':function(d){
							if(d.value === data.median) return 'median vote-group';
							return 'vote-group';
						}
					});

			d3.selectAll('g.vote-group')
				.attr({
					'transform':function(d){
						return 'translate(0,' + yScale(d.value) +')'
					}
				}).each(dotGroup);
		}

		function dotGroup(data){
			var radius = 2;
			var data = new Array(data.count);
			var parent = d3.select(this);

			parent.selectAll('circle')
				.data(data)
					.enter()
				.append('circle');
					
			parent.selectAll('circle').attr({
				cy:0,
				cx:function(d,i){
					return radius + (i*(radius+1)*2);
				},
				r:radius
			});
		}
	}

	chart.data = function chartData(arr){
		if(!arr) return data;
		data = arr;
		return chart;
	}

	chart.xScale = function chartXScale(scale){
		if(!scale) return scale;
		xScale = scale;
		return chart;
	}

	chart.yScale = function chartYScale(scale){
		if(!scale) return scale;
		yScale = scale;
		return chart;
	}

	chart.margins = function chartMargins(o){
		return chart;
	}

	return chart;
}
