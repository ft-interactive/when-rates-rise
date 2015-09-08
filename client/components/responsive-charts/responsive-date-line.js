console.log('responsiveLine')

function responsiveLine(){
	var xScale = d3.time.scale(),
		yScale = d3.scale.linear(),
		valueDomain,
		dateDomain,
		margins = {top:40, left:20, bottom:30, right:30 },
		data = [],
		annotations = [],
		lineData = {},
		keyLabels = {};

	function dateAscending(a, b) {
		a = a.date.getTime();
		b = b.date.getTime();
		return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
	}

	function keyElement(d,i){
		console.log(d,i);
		var container = d3.select(this);

		container.append('line')
			.attr({
				'x1':0, 
				'y1':-5,
				'x2':15,
				'y2':-5,
				'class':'s' + i + '-line-key'
			});

		container.append('text')
			.attr({
				'x':20, 
				'y':0
			})
			.text(function(d){
				return keyLabels[d];
			});

		console.log( container.node().getBoundingClientRect().width );
	}

	function chart(g){

		var bounds = g.node().getBoundingClientRect(),
			plotWidth = bounds.width - (margins.left + margins.right),
			plotHeight = bounds.height - (margins.top + margins.bottom);

		xScale.domain(dateDomain).range([0, plotWidth]).nice();
		yScale.domain(valueDomain).range([plotHeight, 0]).nice();

		//key 
		var keyContainer = g.selectAll('g.key-element')
			.data( Object.keys(lineData) )
			.enter()
				.append('g')
					.attr('class','key-element')
					.each(keyElement);

		//space out the key
		var maxKeyWidth = 0;
		keyContainer
			.each(function(){
				maxKeyWidth = Math.max( maxKeyWidth, d3.select(this).node().getBoundingClientRect().width );
			});

		console.log('MAX' , maxKeyWidth);
		keyContainer.attr('transform',function(d,i){ 
			return 'translate(' + (i * (maxKeyWidth+20)) + ',' + margins.top/2 + ')';
		});

		//axes
		var xAxis = d3.svg.axis()
			.scale( xScale )
			.ticks(9)
			.tickFormat(function(d,i){
				var year = d.getFullYear();
				if(year%1000 ===0 || i === 0) return year;
				if(year%100 < 10) return '0'+year%100;
				return ''+year%100;
			})
			.orient( 'bottom' );

		var yAxis = d3.svg.axis()
			.scale( yScale )
			.tickSize(plotWidth)
			.ticks(5)
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
			.attr('transform','translate('+ (margins.left) +', ' + margins.top + ')')
			.call(yAxis)
				.selectAll('text').attr('dy','');

		//line
		var lineKeys = Object.keys(lineData);
		var line = d3.svg.line()
				.x(function(d) { return xScale(d.date); })
				.y(function(d) { return yScale( Number(d.value) ); });

		for(var i in lineKeys){

			var key = lineKeys[i],
				lineD = lineData[key];

			g.selectAll('.interest-rate-line')
				.data([1]).enter()
					.append('path')
						.datum( lineD )
						.attr( 'class', 's'+i+'-line');
	
			g.select( '.s'+i+'-line' )
				.datum( lineD )
				.attr( 'transform','translate(' + margins.left + ', ' + margins.top + ')')
				.attr( 'd', line);
		}
	}

	chart.keyLables = function(d){
		keyLabels = d;
		return chart;
	};

	chart.data = function(d){
		var dateFormat = d3.time.format('%Y-%m-%d');
		data = d.map(function(record){
			record.date = dateFormat.parse(record.date);
			return record;
		});
		var lineKeys = Object.keys(data[0])
						.filter( function(d){ return d!='date'; } );

		valueDomain = [];

		for(var i = 0; i < lineKeys.length; i++){
			var key = lineKeys[i];
			lineData[ key ] = data.map( function(d){ 
					return {
						value: d[ key ],
						date: d.date
					}
				});

			lineData[ key ] = lineData[ key ].filter( function(d){
					return !(d.value == null || d.value == undefined || d.value == '');
				});

			lineData[ key ].sort(dateAscending)

			valueDomain.push( d3.max(data, function(d){ return Number(d[ key ]); }) );
			valueDomain.push( d3.min(data, function(d){ return Number(d[ key ]); }) );
		}

		valueDomain = d3.extent(valueDomain);

		dateDomain = d3.extent(data, function(d){	
			return d.date;
		});

		return chart;
	};

	return chart;
}