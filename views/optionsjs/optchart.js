
function changeInstrument() {
  var div = document.getElementById("instrument");
  if(div.innerHTML === 'NIFTY') {
    div.innerHTML = 'BANKNIFTY';
  } else {
    div.innerHTML = 'NIFTY'
  }
  startLoad();
}

startLoad();

function startLoad(integerdate) {
  var instrument = 'NIFTY';

  var div = document.getElementById("instrument")
  if(div) {
    instrument = div.innerHTML;  
  }
  console.log('start chart')

  let date = integerdate ? "/" + integerdate : ""

  d3.json("/getoptionshist/" + instrument + date, //"test.csv",
  //"https://raw.githubusercontent.com/holtzy/data_to_viz/master/Example_dataset/3_TwoNumOrdered_comma.csv",  
  //d3.csv("/getoptionshist",

    // When reading the csv, I must format variables:
    /*
    function(d){
      return { date : d3.timeParse("%Y-%m-%d %H:%M")(d.date), value : d.value }
    },
  */
  // Now I can use this dataset:
    function(data) {
      data.reverse();
      console.log(data[0])
      var margin = {top: 10, right: 30, bottom: 30, left: 60},
      width = 460 - margin.left - margin.right,
      height = 400 - margin.top - margin.bottom;

      document.getElementById("my_dataviz").innerHTML = '';
  // append the svg object to the body of the page
    var svg = d3.select("#my_dataviz")
      .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform",
              "translate(" + margin.left + "," + margin.top + ")");
      // Add X axis --> it is a date format

      //var dateParser = d3.timeParse("%Y-%m-%d %H:%M");

      data = processData(data, 20);

      var x = d3.scaleTime()
        .domain(d3.extent(data, function(d) {
            //var time = dateParser(d.time);
            //console.log(time); 
            return d.parsedDate; 
          }))
        .range([ 0, width ]);
      svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

      // Add Y axis
      var y = d3.scaleLinear()
        .domain([d3.min(data, function(d) { return d.putcalldiff; }), d3.max(data, function(d) { return d.putcalldiff; })])
        .range([ height, 0 ]);
      svg.append("g")
        .call(d3.axisLeft(y));

      // Add the line
      svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .attr("d", d3.line()
          .x(function(d) { return x(d.parsedDate) })
          .y(function(d) { return y(d.putcalldiff) })
          )

      svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "red")
        .attr("stroke-width", 1.5)
        .attr("d", d3.line()
          .x(function(d) { return x(d.parsedDate) })
          .y(function(d) { return y(d.sma) })
          )      

      createTable(data, '');

  })
}
function processData(data, smaPeriod) {
  var dateParser2 = d3.timeParse("%Y%m%d %H:%M");  
  var dateParser1 = d3.timeParse("%Y-%m-%d %H:%M");  

  for(var i = 0; i < data.length; i++) {
    var row = data[i];

    row.parsedDate = dateParser1(row.time);

    if(!row.parsedDate) {
      row.parsedDate = dateParser2(row.time);      
    }    
    
    var sum = 0;
    var count = 0;
    for(var j = Math.max(i - smaPeriod + 1, 0); j <= i; j++){
      sum += data[j].putcalldiff;
      count++;

      if(i==0) {
        console.log(sum)
        console.log(count)
      }
    }

    row.sma = sum/count
  }

  return data;
}


function createTable(tableData, direction) {
    if(direction === 'reverse') {
      tableData.reverse();
    }

    let myObj = tableData;
      var txt = '';
      txt += "<table border='1'>"
      txt += "<tr><th>Time</th>" + 
          "<th>Call Vol</th><th>Call OI</th><th>Call OI chg</th>" + 
          "<th>Put Vol</th><th>Put OI</th><th>Put OI chg</th>" + 
          "<th>SMA20</th><th>Put-Call OI-change Diff</th></tr>"
      for (x in myObj) {
        txt += "<tr><td>" + myObj[x].time + "</td>";
        txt += "<td>" + myObj[x].call_vol + "</td>";
        txt += "<td>" + myObj[x].call_oi + "</td>";
        txt += "<td>" + myObj[x].call_chg_oi + "</td>";

        txt += "<td>" + myObj[x].put_vol + "</td>";
        txt += "<td>" + myObj[x].put_oi + "</td>";
        txt += "<td>" + myObj[x].put_chg_oi + "</td>";
        txt += "<td>" + myObj[x].sma + "</td>";
        
        txt += '<td style="align:right">' + myObj[x].putcalldiff + "</td></tr>";
      }
      txt += "</table>"
      document.getElementById("demo").innerHTML = txt;
  }

  function oldCode() {
    /*
    console.log('start')
    let xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
      if (xmlhttp.readyState === 4) {
        console.log('get resp')
        let myObj = JSON.parse(this.responseText);
        var txt = '';
        txt += "<table border='1'>"
        txt += "<tr><th>Time</th>" + 
            "<th>Call Vol</th><th>Call OI</th><th>Call OI chg</th>" + 
            "<th>Put Vol</th><th>Put OI</th><th>Put OI chg</th>" + 
            "<th>SMA</th><th>Put-Call OI-change Diff</th></tr>"
        for (x in myObj) {
          txt += "<tr><td>" + myObj[x].time + "</td>";
          txt += "<td>" + myObj[x].call_vol + "</td>";
          txt += "<td>" + myObj[x].call_oi + "</td>";
          txt += "<td>" + myObj[x].call_chg_oi + "</td>";

          txt += "<td>" + myObj[x].put_vol + "</td>";
          txt += "<td>" + myObj[x].put_oi + "</td>";
          txt += "<td>" + myObj[x].put_chg_oi + "</td>";
          txt += "<td>" + myObj[x].sma + "</td>";
          
          txt += '<td style="align:right">' + myObj[x].putcalldiff + "</td></tr>";
        }
        txt += "</table>"
        document.getElementById("demo").innerHTML = txt;
      }
    }

    xmlhttp.onerror = function() {
      console.log('error')
    }
    xmlhttp.open("GET", "/getoptionshist");
    xmlhttp.setRequestHeader("Content-type", "application/json");
    xmlhttp.send();
    */
 }