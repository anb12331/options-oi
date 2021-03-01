const schedule = require('node-schedule');
const dataProcessor = require('./data-processor')

module.exports = {jobToRun: jobToRun}

var j = schedule.scheduleJob({rule: '*/5 9-15 * * 1-5', tz: 'Asia/Kolkata'}, jobToRun);

function jobToRun() {	
	try {
		let date = new Date();
		if(date.getUTCHours() >= 10 ) {			
			console.log(`Skipping job after 15:30 IST. Time is ${date.toString()}` );
		} else {
			console.log('Execute job at ' + date.toString());
		  	dataProcessor.getOptionsData(0).then(() => {
		  		console.log('Finished part 0 execution');
		  		setTimeout(function() {
		  			dataProcessor.getOptionsData(1).then(() => {
		  				console.log('Finished part 1 execution');
		  			})
		  		}, 2000);
		  	})
	  	}
  	} catch(error) {
  		console.log(error);
  	}  	
}