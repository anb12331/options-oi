const schedule = require('node-schedule');
const dataProcessor = require('./data-processor')
const storage = require('./objectstorage-service')
const time = require('./time-service') 

module.exports = {jobToRun: jobToRun}

var j = schedule.scheduleJob({rule: '*/5 9-15 * * 1-5', tz: 'Asia/Kolkata'}, jobToRun);

var fileUploaded = false;

function jobToRun() {	
	try {
		let date = new Date();
		if(date.getUTCHours() > 10 || (date.getUTCHours() == 10 && date.getUTCMinutes() > 8)) {			
			console.log(`Skipping job after 15:35 IST. Time is ${date.toString()}` );

			if(!fileUploaded) {
				let timeNow = time.getFormattedTimeIST()
				console.log(`Backing up db at ${timeNow.datetime}` );
				let name = `${timeNow.date}T${timeNow.hour}-${timeNow.min}-sqldb`;
				storage.uploadFile(name, './db/options.db', function() {
					fileUploaded = true;	
					console.log('file uploaded successfully: ', name);
				})
				
			}
		} else {
			fileUploaded = false;
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