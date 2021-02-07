const express = require('express')

const dataProcessor = require('./data-processor')
const scheduler = require('./scheduler')

const app = express()
const port = 3000

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html')
})

app.get('/options', (req, res) => {
	dataProcessor.getOptionsData()
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

app.get('/getoptionshist', (req, res) => {
	dataProcessor.getOptionsHist()
	.then(data => {
		res.send(data);
	})
})

app.use(express.static('public'))


app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})