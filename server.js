var express = require("express");
var app = express();
var cfenv = require("cfenv");
var bodyParser = require('body-parser')
const dataProcessor = require('./options/data-processor')
const scheduler = require('./options/scheduler')

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())


app.use(express.static(__dirname + '/views'));

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
  let dateObj = dataProcessor.getFormattedDate();

  var instrument = req.params.instrument === 'BANKNIFTY' ? 1 : 0;

  dataProcessor.getOptionsHist(dateObj.date, instrument)
  .then(data => {
    res.send(data);
  })
})

app.get('/testscheduler', (req, res) => {
  scheduler.jobToRun();
  res.send("Job started. Check logs.");
})


var port = process.env.PORT || 3001
app.listen(port, function() {
    console.log("To view your app, open this link in your browser: http://localhost:" + port);
});
