function marketProbability(){
	var xScale = d3.time.scale(),
		yScale = d3.scale.linear(),
		margins = {top:20, left:20, bottom:30, right:30 },
		data = [],
		rateIncrement = 0.25,
		dateFormat = d3.time.format('%b \'%y');

	function chart(g){
		var bounds = g.node().getBoundingClientRect(),
			plotWidth = bounds.width - (margins.left + margins.right),
			plotHeight = bounds.height - (margins.top + margins.bottom);

		var valueDomain = [0, rateIncrement * ( data[data.length-1].distribution.length )];
		//console.log(valueDomain);
		var dateDomain = d3.extent(data, function(d){	
			return d.date;
		});

		xScale.domain(dateDomain).range([ 0, plotWidth ]);
		yScale.domain(valueDomain).range([ plotHeight, 0 ]);

		//axes
		var xAxis = d3.svg.axis()
			.tickValues(data.map(function(d){ return d.date }))
			.tickFormat(function(d){
				return dateFormat(d);
			})
			.scale( xScale )
			.orient( 'bottom' );


		var yAxis = d3.svg.axis()
			.scale( yScale )
			.tickSize(plotWidth)
			.orient( 'right' );

		g.selectAll('.x.axis').data([1]).enter()
			.append('g')
			.attr('class','x axis');
		
		g.selectAll('.x.axis')
			.attr('transform','translate('+margins.left+',' + (plotHeight+margins.top) + ')')
			.call(xAxis)
				.selectAll('text').attr('style','');

		g.selectAll('.y.axis').data([1]).enter()
			.append('g')
			.attr('class','y axis');

		g.selectAll('.y.axis')
			.attr('transform','translate('+ margins.left +', ' + margins.top + ')')
			.call(yAxis)
				.selectAll('text')
				.attr('dy',0);

		//meetings (there's a probability distribution for each meeting)
		//so attach adistribution at each apprpriate pointpoint
		g.selectAll('.plot').data([1]).enter()
			.append('g').attr('class','plot')

		var p = d3.selectAll('.plot');
		p.attr('transform', function(d){
			return 'translate('+margins.left+','+margins.top+')'
		})

		p.selectAll('.probability-distribution').data(data)
			.enter()
				.append('g').attr({'class':'probability-distribution'});

		p.selectAll('.probability-distribution').attr({
				'transform':function(d){
					return 'translate(' + xScale(d.date) + ',0)'
				}
			}).each(function(d){
				var parent = d3.select(this)
				parent.selectAll('.probability').data(d.distribution)
					.enter()
						.append('rect')
						.attr({
							'class':'probability',
							'x':0,
							'y':function(d,i){
								return yScale((i+1)*rateIncrement);
							},
							'width':function(d){
								return d * 100;
							},
							'height':yScale(rateIncrement) - yScale(rateIncrement*2)
						});

			});

	}

	chart.probabilityTree = function(tree){
		data = tree.map(function(d){
			//console.log(productSum/d.distribution.length * rateIncrement);
			d.expectedValue = getExpectedValue( d.distribution ) * rateIncrement;
			//console.log(d.date, d.expectedValue);
			return d;
		});
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