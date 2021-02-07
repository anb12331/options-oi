const schedule = require('node-schedule');
const dataProcessor = require('./data-processor')

var j = schedule.scheduleJob('*/5 4-10 * * 1-5', function(){  
	console.log('Execute job at ' + (new Date()).toString());
  	dataProcessor.getOptionsData().then(() => {
  		console.log('Finished job execution');
  		setTimeout(dataProcessor.getOptionsData(1), 2000);
  	})
});