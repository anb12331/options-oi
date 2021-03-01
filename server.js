var express = require("express");
var app = express();
var cfenv = require("cfenv");
var bodyParser = require('body-parser')
const dataProcessor = require('./options/data-processor')
const scheduler = require('./options/scheduler')
const dbService = require('./options/db-service');
const time = require('./options/time-service');


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
  dbService.createDb()
  .then(data => {
    res.send(data);
  })
})

app.get('/getoptionshist/:instrument/:integerdate?', (req, res) => {
  let integerdate = req.params.integerdate;
  let allData = true;

  if(!integerdate) {
    integerdate = time.getFormattedTimeIST().date;
    allData = false;
  }

  var instrument = req.params.instrument === 'BANKNIFTY' ? 1 : 0;

  dbService.getOptionsHist(integerdate, instrument, allData)
  .then(data => {
    res.send(data);
  })
})

app.get('/testscheduler', (req, res) => {
  scheduler.jobToRun();
  res.send("Job started. Check logs. Next Thu date is: " + time.getNextThuDate());
})


var port = process.env.PORT || 3001
app.listen(port, function() {
    console.log("To view your app, open this link in your browser: http://localhost:" + port);
});
