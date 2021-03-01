const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const axios = require('axios')
const dbService = require('./db-service');
const time = require('./time-service');

module.exports = {
	getOptionsData: getOptionsData}

const niftyUrl = "https://www.nseindia.com/api/option-chain-indices?symbol=NIFTY";
const edwsUrl = "https://ewmw.edelweiss.in/api/Market/optionchaindetails";


async function getOptionsData(instrument) {
	try{
		console.log('start request')

		let edwsPayload = {"exp": time.getNextThuDate(), "aTyp": "OPTIDX", "uSym": "NIFTY"} //getNextThuDate()
		let edwsPayloadBankNifty = {"exp": time.getNextThuDate(), "aTyp": "OPTIDX", "uSym": "BANKNIFTY"}


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

		dbService.insertToDb(sums, instrument);

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

	return shortElem;
}

function parseInt1(str) {
	return str ? parseFloat(str) : 0;
}


function addFinalCalc(sums) {
	sums.putCallDiff = sums.PEchangeinOI - sums.CEchangeinOI;
	var dateObj = time.getFormattedTimeIST();
	sums.time = dateObj.datetime;
	sums.dateObj = dateObj; 	
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