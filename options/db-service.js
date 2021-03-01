const sqlite3 = require('sqlite3').verbose();

module.exports = {createDb: createDb, insertToDb: insertToDb,
	getOptionsHist: getOptionsHist}


async function createDb() {
	var db = null
	try {
		db = new sqlite3.Database('./db/options.db', (err) => {
		  if (err) {
		    console.error(err.message);
		  }
		  console.log('Connected to the options database.');
		});		

		db.run('CREATE TABLE hist(' + 
				' put_oi int, put_chg_oi int, put_vol int, ' + 
				' call_oi int, call_chg_oi int, call_vol int,' + 
				' putcalldiff int, time datetime)', (err) => {
			if(err) {
				console.log(err);
			}
		});
	} catch(err) {
		console.log(err)
	} finally {
		if(db) {
			db.close((err) => {
			  if (err) {
			    console.error(err.message);
			  }
			  console.log('Close the database connection.');
			});
		}

		return true;
	}	
}


function insertToDb(sums, instrument) {	
	let db = new sqlite3.Database('./db/options.db', (err) => {
	  if (err) {
	    console.error(err.message);
	  }
	  console.log('Connected to the options database.');
	});

	let peVol = sums.PEvolume;	

	if(instrument === 0) {
		peVol = -peVol;
	}

	console.log(peVol);

	db.run(`INSERT INTO hist(put_oi, put_chg_oi, put_vol, ` + 
							` call_oi, call_chg_oi, call_vol, ` + 
							` putcalldiff, time, ` +
							` date, hour, min) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
			[parseFloat(sums.PEOI).toFixed(2), parseFloat(sums.PEchangeinOI).toFixed(2), peVol,
			 parseFloat(sums.CEOI).toFixed(2), parseFloat(sums.CEchangeinOI).toFixed(2), parseFloat(sums.CEvolume).toFixed(2), 
			 parseFloat(sums.putCallDiff).toFixed(2), sums.time,
			 sums.dateObj.date, sums.dateObj.hour, sums.dateObj.min], function(err) {
	    if (err) {
	      return console.log(err.message);
	    }
	    // get the last insert id
	    console.log(`A row has been inserted with rowid ${this.lastID}`);
	});

	db.close((err) => {
	  if (err) {
	    console.error(err.message);
	  }
	  console.log('Close the database connection.');
	});

	return;
}


function getOptionsHist(intDate, instrument, allData) {
	return new Promise((resolve, reject) => {
		let db = new sqlite3.Database('./db/options.db', (err) => {
		  if (err) {
		    console.error(err.message);
		  }
		  console.log('Connected to the options database.');
		});

		let timeFilter = allData ? "" : " and (hour*100 + min) <= 1530 and (hour*100 + min) >= 915 "

		let put_vol_filter = " put_vol " + (instrument ? " > 0 " : " <= 0 ");

		let sql = " select * from hist where date = ? and " + put_vol_filter + timeFilter +
			" order by date desc, hour desc, min desc ";

		console.log(sql);

		db.all(sql ,[intDate], (err, rows) => {
		  if (err) {
		  	console.error(err);
		  } else {
		  	resolve(rows);
		  }
		});

		db.close((err) => {
		  if (err) {
		    console.error(err.message);
		  }
		  console.log('Close the database connection.');
		});

		return;
	})
}