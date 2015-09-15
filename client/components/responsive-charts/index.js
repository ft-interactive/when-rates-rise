
function debounce (fn, timeout) {
  var timeoutID = -1;
  return function() {
    if (timeoutID > -1) {
      window.clearTimeout(timeoutID);
    }
    timeoutID = window.setTimeout(fn, timeout);
  }
};

document.addEventListener('DOMContentLoaded', function () {
	var resizeHandlers = [];

	d3.select(window).on('resize', function(){
		resizeHandlers.forEach(function(f){
			f();
		})
	});

	d3.selectAll('.responsive-date-line')
		.each(function(){
			var parent = d3.select(this);
			var bounds = parent.node().getBoundingClientRect();
			var svg = parent.append('svg')
				.attr({
					height: bounds.height,
					width: bounds.width
				});
			var baseline = this.dataset.baseline;
			d3.csv(this.dataset.source, function(data){
				var chart = responsiveLine()
								.data(data, baseline)
								.keyLables({
									'Fed target':'Fed target rate',
									'base rate':'BoE base rate',
									'US 10yr bond':'10yr US bond yield',
									'10yr bond':'10yr UK bond yield'
								});

				resizeHandlers.push(debounce(function(){
					var bounds = parent.node().getBoundingClientRect();
					svg.attr({
						width: bounds.width,
						height: bounds.height
					});
					svg.call( chart );
				}, 125));

				svg.call( chart );
			});
		});

	d3.selectAll('.dot-plot')
		.each(function(){
			var parent = d3.select(this);
			var bounds = parent.node().getBoundingClientRect();
			var svg = parent.append('svg')
				.attr({
					height:bounds.height,
					width:bounds.width
				});

			d3.json(this.dataset.source, function(data){
				var chart = dotPlot()
					.data(data);

				resizeHandlers.push(debounce(function (){
					var bounds = parent.node().getBoundingClientRect();
					svg.attr({
						width: bounds.width,
						height: bounds.height
					});
					svg.call(chart);
				}, 125));
				
				svg.call(chart);
			});
		});

	d3.selectAll('.market-probability')
		.each(function(){
			var parent = d3.select(this);
			var bounds = parent.node().getBoundingClientRect();
			var svg = parent.append('svg')
				.attr({
					height:bounds.height,
					width:bounds.width
				});
			var dataset = this.dataset;
			d3.json(dataset.interestRateProbabilitySource, function(data){
				//console.log('got interest rate probabilities', data);
				data = data.map(function(d){ 
					d.date = new Date(d.date); 
					return d; 
				});
				
				var chart = marketProbability()
					.probabilityTree(data);

				resizeHandlers.push(debounce(function (){
					var bounds = parent.node().getBoundingClientRect();
					svg.attr({
						width: bounds.width,
						height: bounds.height
					});
					svg.call(chart);
				}, 125));

				svg.call(chart);
			});
		})

});