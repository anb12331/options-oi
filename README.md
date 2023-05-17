# Put Call OI Difference for Options
This Node JS application calculates the Put/Call Open Interest difference (similar to Put Call Ratio, or PCR) for Nifty and BankNifty options, averaging on nearest 5 ITM/ATM and 5 OTM options to predict future market direction. Data is persisted daily to IBM ObjectStorage (HDFS equivalent)
Options Data is sourced form a free public API (Edelweiss). App may be run locally or deployed to a IBMCloud (or any) Kubernetes cluster

A. Install Nodejs 

B. run commands
npm ci
node server.js  

C. open url http://localhost:3001

D. To ext site, Ctrl + C on cmd

The important files are:
1. server.js
2. options/data-processor.js
3. options/sceduler.js
4. views/index.html
5. views/optionsjs/optchart.js
6. db/options.db (this is a SQLITE3 file - all options data is stored here)
7. package.json  


Please ignore all other files. They are for deploying to ibm cloud
