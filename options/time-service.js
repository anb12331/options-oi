module.exports = {getNextThuDate: getNextThuDate, getFormattedTimeIST: getFormattedTimeIST,
 getIndianDateTime: getIndianDateTime}


const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function getNextThuDate(weekOffset) {

	if(!weekOffset) weekOffset = 0;

	let today = getIndianDateTime();

	console.log('System time is: ' + new Date().toString());
	console.log('IST Time now is:' + today.toString());

	let dayOfWeek = today.getDay();

	console.log('Day of week is: ' + dayOfWeek);

	if(dayOfWeek === 0) dayOfWeek = 7;

	today.setDate(today.getDate() + (dayOfWeek <= 4 ? 4 - dayOfWeek : 7 - dayOfWeek + 4) + weekOffset * 7);

	let dayOfMonth = today.getDate();
	let day = dayOfMonth < 10 ? "0" + dayOfMonth.toString() : dayOfMonth.toString();

	let month = months[today.getMonth()];

	let year = today.getFullYear();

	let result = `${day} ${month} ${year}`;
	
	console.log('Final date is ' + result)

	if(result === '11 Mar 2021') {
		result = '10 Mar 2021';
	}

	return result;
}


function getIndianDateTime() {
	let d = new Date();
	return new Date(d.getTime() + 5.5*3600 * 1000 + d.getTimezoneOffset()*60*1000);
}


function getFormattedTimeIST() {
    var date = getIndianDateTime();
    var str = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " 
    +  date.getHours() + ":" + date.getMinutes();

    var intdate = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();

    return {datetime: str, date: intdate, hour: date.getHours(), min: date.getMinutes()};
}
