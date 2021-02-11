const schedule = require('node-schedule');
const dataProcessor = require('./data-processor')

module.exports = {jobToRun: jobToRun}

var j = schedule.scheduleJob('*/5 3-10 * * 1-5', jobToRun);

function jobToRun() {	
	try {
		console.log('Execute job at ' + (new Date()).toString());
	  	dataProcessor.getOptionsData(0).then(() => {
	  		console.log('Finished part 0 execution');
	  		setTimeout(function() {
	  			dataProcessor.getOptionsData(1).then(() => {
	  				console.log('Finished part 1 execution');
	  			})
	  		}, 2000);
	  	})
  	} catch(error) {
  		console.log(error);
  	}  	
}