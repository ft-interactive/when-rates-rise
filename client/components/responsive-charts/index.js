console.log("hello responsive lines! d3 v:" + d3.version)

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

			d3.csv(this.dataset.source, function(data){
				var chart = responsiveLine()
								.data(data)
								.keyLables({
									'Fed target':'Fed target rate (%)',
									'base rate':'BoE base rate (%)',
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

});