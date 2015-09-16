function marketProbability(){
	var xScale = d3.scale.linear(),
		yScale = d3.scale.ordinal(),
		distributionYScale = d3.scale.linear(),
		margins = {top:60, left:0, bottom:30, right:0 },
		gutter = 20,
		data = [],
		rateIncrement = 0.25,
		meetingDate = d3.time.format('%d %b %Y');

	function chart(g){
		var bounds = g.node().getBoundingClientRect(),
			plotWidth = bounds.width - (margins.left + margins.right),
			plotHeight = bounds.height - (margins.top + margins.bottom);

		var valueDomain = [0, rateIncrement + rateIncrement * ( data[data.length-1].distribution.length )];
		var dateDomain = data.map(function(d){ return d.date; });
		var meetingLabelWidth = plotWidth/3 - gutter/2;
		var probabilityColumnWidth = 2*plotWidth/3 - gutter/2;

		xScale.domain(valueDomain).range([ 0, probabilityColumnWidth ]);
		yScale.domain(dateDomain).rangeBands([ 0, plotHeight ]);
		distributionYScale.domain([1,0]).range([yScale.rangeBand(), 0]);

//axis
		g.selectAll('.axis-increment')
			.data(d3.range(0, valueDomain[1], rateIncrement))
				.enter()
			.append('g')
				.attr('class','axis-increment')
				.call(function(parent){
					parent.append('text').attr('class','axis-label');
					parent.append('line').attr('class','axis-line');
				})

		g.selectAll('.axis-label')
			.attr({
				y:margins.top-4,
				x:function(d){
					return plotWidth - probabilityColumnWidth + xScale(d);
				},
				'font-size':function(){
							if(plotWidth>580) return '';
							if(plotWidth>400) return '14px';
							return '10px'
						},
				'text-anchor':'middle'
			}).text(function(d){
				if(d === 0) return d;
				if(d%1 === 0) return d+'.0';
				if(d%0.5 === 0) return d;
				return '';
			})

		g.selectAll('.axis-title').data([0]).enter()
			.append('text')
				.attr({
					class:'axis-title',
					y:margins.top-24,
					x:function(){
						return plotWidth - probabilityColumnWidth;
					},
					'font-size':function(){
							if(plotWidth>580) return '';
							if(plotWidth>400) return '14px';
							return '10px'
						}
				
				}).text('Federal funds effective interest rate')


		g.selectAll('.axis-line')
			.attr({
				x1:function(d){
					return plotWidth - probabilityColumnWidth + xScale(d);
				},
				y1:margins.top,
				x2:function(d){
					return plotWidth - probabilityColumnWidth + xScale(d);
				},
				y2:plotHeight + margins.top
			});
		

//distributions
		g.selectAll('g.distributions').data([0]).enter()
			.append('g')
				.attr('class','distributions');

		g.selectAll('g.distributions')
			.attr('transform','translate('+(plotWidth - probabilityColumnWidth)+',0)');

		g.select('.distributions').selectAll('.probability-distribution')
			.data(data)
				.enter()
			.append('g')
				.attr({
					'class':'probability-distribution',
					'transform':function(d){
						return 'translate(0, ' + (margins.top + yScale(d.date)) + ')';
					}
				})

		g.selectAll('.probability-distribution')
			.each(function(d){
				var parent = d3.select(this);
				
				var dataEnter = parent.selectAll('.probability')
					.data(d.distribution)
						.enter()
				
				dataEnter.append('rect')
					.attr('class','probability')

				dataEnter.append('text')
					.attr('class','probability-label')
						.text(function(d){
							var rounded = Math.round(d * 10) / 10;
							if (rounded === 0) return '';
							return rounded*100 + "%";
						});

				parent.selectAll('.probability-label')
					.attr({
						x:function(d,i){ return xScale(i/4) + xScale(1/8); },
						'text-anchor':'middle',
						y:function(d){
							return distributionYScale(1) - distributionYScale(d) - 2; 
						},
						'font-size':function(){
							if(plotWidth>580) return '';
							if(plotWidth>400) return '14px';
							return '10px'
						}
					})

				parent.selectAll('.probability')
					.attr({
						y:function(d){
							if(distributionYScale(d)<1) return distributionYScale(1) - 1;
							return distributionYScale(1) - distributionYScale(d); 
						},
						x:function(d,i){ return xScale(i/4); },
						height:function(d){
							if(distributionYScale(d)<1) return 1;
							return distributionYScale(d);
						},
						width:xScale(0.25),
						opacity:function(d){
							var rounded = Math.round(d * 10) / 10;
							if (rounded === 0) return 0.1;
							return rounded;
						}
					})
			});


//labels
		g.selectAll('g.meetings').data([0]).enter()
			.append('g')
				.attr('class','meetings')

		g.select('g.meetings')
			.selectAll('.meeting-label')
				.data(data.map(function(d){ return d.date; }))
			.enter()
				.append('text').attr('class','meeting-label');

		g.selectAll('.meeting-label')
			.attr({
				'transform':function(d,i){
								return 'translate(' + meetingLabelWidth + ', ' + (margins.top + yScale(d) + yScale.rangeBand()) + ')';
							},
				'text-anchor':'end'
			})
			.text(function(d){
				return meetingDate(d);
			})


	}

	chart.probabilityTree = function(tree){
		data = tree;
		return chart;
	}

	return chart;
}

function getExpectedValue(arr){
	var expectation = arr.reduce(function(previous, current, index){
		return previous + current*index; 
	},0);
	return expectation;
}