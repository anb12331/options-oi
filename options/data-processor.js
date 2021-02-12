const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const axios = require('axios')
const sqlite3 = require('sqlite3').verbose();
const months = ['Jan', 'Feb']


module.exports = {
	getOptionsData: getOptionsData, createDb: createDb,
	getOptionsHist: getOptionsHist, getFormattedDate: getFormattedDate,
	getNextThuDate: getNextThuDate
}

const niftyUrl = "https://www.nseindia.com/api/option-chain-indices?symbol=NIFTY";

const edwsUrl = "https://ewmw.edelweiss.in/api/Market/optionchaindetails";
let edwsPayload = {"exp": "18 Feb 2021", "aTyp": "OPTIDX", "uSym": "NIFTY"} //getNextThuDate()
let edwsPayloadBankNifty = {"exp": "18 Feb 2021", "aTyp": "OPTIDX", "uSym": "BANKNIFTY"}


function getNextThuDate() {
	let today = getIndianDateTime();

	console.log('System time is: ' + new Date().toString());
	console.log('IST Time now is:' + today.toString());

	let dayOfWeek = today.getDay();

	console.log('Day of week is: ' + dayOfWeek);

	if(dayOfWeek === 0) dayOfWeek = 7;

	today.setDate(today.getDate() + (dayOfWeek <= 4 ? 4 - dayOfWeek : 7 - dayOfWeek + 4));

	let dayOfMonth = today.getDate();
	let day = dayOfMonth < 10 ? "0" + dayOfMonth.toString() : dayOfMonth.toString();

	let month = months[today.getMonth()];

	let year = today.getFullYear();

	let result = `${day} ${month} ${year}`;
	
	console.log('Final date is ' + result)

	return result;
}

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

async function getOptionsData(instrument) {
	try{
		console.log('start request')
		let result = await axiosPost(edwsUrl, instrument === 1 ? edwsPayloadBankNifty : edwsPayload);//testaxiosGet(); //

		let optionsData = result.opChn;		
		
		var filtered = [];

		var sums = {
			PEchangeinOI: 0, PEOI: 0, PEvolume: 0,
			CEchangeinOI: 0, CEOI: 0, CEvolume: 0
		}

		var i = 0;

		for(i =0; i < optionsData.length; i++) {					
			if(optionsData[i].atm) {
				break;
			}			
		}

		let start = Math.max(i - 8, 0);
		let end = Math.min(i + 7, optionsData.length);

		for(var j = start; j < end; j++) {
			var elem = optionsData[j]			
			filtered.push(addSum(elem, sums));
		}

		addFinalCalc(sums);

		insertToDb(sums, instrument);

		return {sum: sums, elems: filtered};
	} catch(err) {
		console.log(err);
	}	
}

function addSum(elem, sums) {
	let shortElem = {};

	shortElem.PEchangeinOI = parseInt1(elem.peQt.opIntChg);
	shortElem.PEOI = parseInt1(elem.peQt.opInt);
	shortElem.PEvolume = parseInt1(elem.peQt.vol);

	shortElem.CEchangeinOI = parseInt1(elem.ceQt.opIntChg);
	shortElem.CEOI = parseInt1(elem.ceQt.opInt);
	shortElem.CEvolume = parseInt1(elem.ceQt.vol);

	let keys = Object.keys(shortElem);

	for(var i in keys) {
		sums[keys[i]] += shortElem[keys[i]]
	}

	shortElem.stkPrc = elem.stkPrc;

	/*
	sums.PE.changeinOI += parseInt1(elem.peQt.opIntChg);
	sums.PE.OI += parseInt1(elem.peQt.opInt);
	sums.PE.volume += parseInt1(elem.peQt.vol);

	sums.CE.changeinOI += parseInt1(elem.ceQt.opIntChg);
	sums.CE.OI += parseInt1(elem.ceQt.opInt);
	sums.CE.volume += parseInt1(elem.ceQt.vol);
	*/
	return shortElem;
}

function parseInt1(str) {
	return str ? parseFloat(str) : 0;
}

function insertToDb(sums, instrument) {	
	let db = new sqlite3.Database('./db/options.db', (err) => {
	  if (err) {
	    console.error(err.message);
	  }
	  console.log('Connected to the options database.');
	});

	db.run(`INSERT INTO hist(put_oi, put_chg_oi, put_vol, ` + 
							` call_oi, call_chg_oi, call_vol, ` + 
							` putcalldiff, time, ` +
							` date, hour, min) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
			[parseFloat(sums.PEOI).toFixed(2), parseFloat(sums.PEchangeinOI).toFixed(2), instrument,
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

function getOptionsHist(intDate, instrument) {
	return new Promise((resolve, reject) => {
		let db = new sqlite3.Database('./db/options.db', (err) => {
		  if (err) {
		    console.error(err.message);
		  }
		  console.log('Connected to the options database.');
		});

		db.all("select * from hist where date >= ? and put_vol = ?  and hour >= 9 and hour <= 15 " + 
				" order by date desc, hour desc, min desc ", 
			[intDate, instrument], (err, rows) => {
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

function addFinalCalc(sums) {
	sums.putCallDiff = sums.PEchangeinOI - sums.CEchangeinOI;
	var dateObj = getFormattedDate();
	sums.time = dateObj.datetime;
	sums.dateObj = dateObj; 	
}

function getFormattedDate() {
    var date = getIndianDateTime();
    var str = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " 
    +  date.getHours() + ":" + date.getMinutes();

    var intdate = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();

    return {datetime: str, date: intdate, hour: date.getHours(), min: date.getMinutes()};
}

function getIndianDateTime() {
	return new Date(new Date().getTime() + 5.5*3600 * 1000);
}

function testaxiosGet() {
	return testEdws;
} 

async function axiosGet(url) {
	let options = {
        method: 'GET',
        url: url        
    };
    let results = await axios(options);

    return results.data;
}

async function axiosPost(url, payload) {	
    let options = {
        method: 'POST',
        url: url,
        data: payload        
    };

    let results = await axios(options);

    return results.data;
}

function httpGet(url) {
	return new Promise((resolve, reject) => {
		console.log('start promise');
	    let xhr = new XMLHttpRequest();
		xhr.open('get', url);
		xhr.send();
		let userdata = {}

		xhr.onreadystatechange = function() {
			if(xhr.readyState === 4) {
				console.log('http success')	
				let result = JSON.parse(xhr.responseText);	
				resolve(result);
			}
		};

		xhr.onerror = function() {	
			console.log('http error')					
			reject({error: "There was an error while executing the request"})
		}		
	});
}

async function getOptionsData0	() {
	try{
		console.log('start request')
		let result = await testaxiosGet(niftyUrl);		

		let optionsData = result.filtered.data;
		let niftySpot = optionsData[0].PE.underlyingValue;

		var lower = niftySpot - 400;
		var upper = niftySpot + 350;

		var filtered = [];

		var sums = {
			PE: {
				changeinOI: 0,
				OI: 0,
				volume: 0
			},
			CE: {
				changeinOI: 0,
				OI: 0,
				volume: 0
			}
		}

		for(var i in optionsData) {
			var elem = optionsData[i]
			console.log('startloop')
			if(elem.strikePrice <= lower) {
				continue;
			} else if (elem.strikePrice > lower && elem.strikePrice <= upper) {
				filtered.push(elem)
				addSum(elem, sums);			
			} else if (elem.strikePrice > upper) {
				break;
			}
		}

		addFinalCalc(sums);

		insertToDb(sums.putCallDiff, sums.time);

		return {sum: sums, elems: filtered};
	} catch(err) {
		console.log(err);
	}	
}

function addSum0(elem, sums) {
	sums.PE.changeinOI += elem.PE.changeinOpenInterest;
	sums.PE.OI += elem.PE.openInterest;
	sums.PE.volume += elem.PE.totalTradedVolume;

	sums.CE.changeinOI += elem.CE.changeinOpenInterest;
	sums.CE.OI += elem.CE.openInterest;
	sums.CE.volume += elem.CE.totalTradedVolume;
}

const testEdws = {
	opChn: [
		{
            "ceQt": {
                "trdSym": "NIFTY04FEB2113750CE",
                "sym": "39530_NFO",               
                "ltp": "184.00",
                "ltt": null,
                "altt": null,
                "lut": null,
                "atp": null,
                "bidPr": "182.00",
                "askPr": "184.00",
                "vol": "2462550",
                "loCt": null,
                "hiCt": null,
                "chg": "-72.75",
                "chgP": "-28.33",               
                "bdSz": "750",
                "akSz": "225",
                "dpExpDt": null,
                "opInt": "1.07",
                "opIntChg": "0.75",               
                "askivfut": "28.47",
                "askivspt": "32.50",
                "bidivfut": "28.18",
                "bidivspt": "32.21",
                "ltpivfut": "28.47",
                "ltpivspt": "32.50",
                "ntTrdVal": null
            },
            "peQt": {
                "trdSym": "NIFTY04FEB2113750PE",
                "sym": "39532_NFO",               
                "ltp": "251.00",
                "ltt": null,
                "altt": null,
                "lut": null,
                "atp": null,
                "bidPr": "241.80",
                "askPr": "251.00",
                "vol": "7664250",
                "loCt": null,
                "hiCt": null,
                "chg": "67.15",
                "chgP": "36.52",              
                "bdSz": "75",
                "akSz": "300",
                "dpExpDt": null,
                "opInt": "1.67",
                "opIntChg": "0.52",                
                "askivfut": "33.35",
                "askivspt": "28.75",
                "bidivfut": "32.04",
                "bidivspt": "27.41",
                "ltpivfut": "33.35",
                "ltpivspt": "28.75",
                "ntTrdVal": null
            },
            "stkPrc": "13750.0",
            "atm": true
        }
	]
}

const testNifty = { "filtered": {
"data": [
	{
		"strikePrice": 14000,
		"expiryDate": "28-Jan-2021",
		"PE": {
			"strikePrice": 14000,
			"expiryDate": "28-Jan-2021",
			"underlying": "NIFTY",
			"identifier": "OPTIDXNIFTY28-01-2021PE14000.00",
			"openInterest": 41673,
			"changeinOpenInterest": -1017,
			"pchangeinOpenInterest": -2.3822909346451158,
			"totalTradedVolume": 1254092,
			"impliedVolatility": 19,
			"lastPrice": 76.65,
			"change": 48.75000000000001,
			"pChange": 174.73118279569897,
			"totalBuyQuantity": 546000,
			"totalSellQuantity": 161325,
			"bidQty": 675,
			"bidprice": 75.8,
			"askQty": 675,
			"askPrice": 76.8,
			"underlyingValue": 13967.5
		},
		"CE": {
			"strikePrice": 14000,
			"expiryDate": "28-Jan-2021",
			"underlying": "NIFTY",
			"identifier": "OPTIDXNIFTY28-01-2021CE14000.00",
			"openInterest": 40962,
			"changeinOpenInterest": 26867,
			"pchangeinOpenInterest": 190.61369279886483,
			"totalTradedVolume": 504989,
			"impliedVolatility": 25.96,
			"lastPrice": 57.05,
			"change": -224.3,
			"pChange": -79.72276523902612,
			"totalBuyQuantity": 509475,
			"totalSellQuantity": 234225,
			"bidQty": 75,
			"bidprice": 56.5,
			"askQty": 225,
			"askPrice": 57.05,
			"underlyingValue": 13967.5
		}
	}
]}}