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