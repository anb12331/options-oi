const express = require('express')

const dataProcessor = require('./options/data-processor')
const scheduler = require('./options/scheduler')

const app = express()
const port = 3000


app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html')
})


app.get('/options/:instrument', (req, res) => {
	var instrument = req.params.instrument === 'BANKNIFTY' ? 1 : 0;
	dataProcessor.getOptionsData(instrument)
	.then(data => {
		res.send(data);
	})
})

app.get('/createdb', (req, res) => {
	dataProcessor.createDb()
	.then(data => {
		res.send(data);
	})
})

app.get('/getoptionshist/:instrument', (req, res) => {
	let dateObj = dataProcessor.getFormattedDate()
	var instrument = req.params.instrument === 'BANKNIFTY' ? 1 : 0;
	dataProcessor.getOptionsHist(dateObj.date, instrument)
	.then(data => {
		res.send(data);
	})
})

app.use(express.static('public'))


app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})