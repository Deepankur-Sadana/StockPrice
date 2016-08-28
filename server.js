/**
 * Quote Stream
 *
 * @version 0.2.1
 * @author NodeSocket <http://www.nodesocket.com> <hello@nodesocket.com>
 */

 /*
 * Copyright (C) 2012 NodeSocket LLC 
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and 
 * associated documentation files (the "Software"), to deal in the Software without restriction, including 
 * without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the
 * following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial 
 * portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
 * TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 * THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF
 * CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 */

////
// CONFIGURATION SETTINGS
///
var PORT = 4000;
var FETCH_INTERVAL = 5000;
var PRETTY_PRINT_JSON = true;
var assert = require('assert');


///
// START OF APPLICATION
///
var express = require('express');
var http = require('http');
var io = require('socket.io');

var app = express();
var server = http.createServer(app);
var io = io.listen(server);
io.set('log level', 1);

server.listen(PORT);

app.get('/', function(req, res) {
	res.sendfile(__dirname + '/index.html');
});

io.sockets.on('connection', function(socket) {
	socket.on('ticker', function(ticker) {
		track_ticker(socket, ticker);
	});
});

function track_ticker(socket, ticker) {

	//Run the first time immediately
	get_quote(socket, ticker);

	//Every N seconds
	var timer = setInterval(function() {
		get_quote(socket, ticker)
	}, FETCH_INTERVAL);

	socket.on('disconnect', function () {
		clearInterval(timer);
	});
}

function get_quote(p_socket, p_ticker) {
	http.get({
		host: 'www.google.com',
		port: 80,
		path: '/finance/info?client=ig&q=' + p_ticker
	}, function(response) {
		response.setEncoding('utf8');
		var data = "";
					
		response.on('data', function(chunk) {
			data += chunk;
		});
		
		response.on('end', function() {
			if(data.length > 0) {
				try {
					var data_object = JSON.parse(data.substring(3));
				} catch(e) {
					return;
				}
									
				var quote = {};
				quote.ticker = data_object[0].t;
				quote.exchange = data_object[0].e;
				quote.price = data_object[0].l_cur;
				quote.change = data_object[0].c;
				quote.change_percent = data_object[0].cp;
				quote.last_trade_time = data_object[0].lt;
				quote.dividend = data_object[0].div;
				quote.yield = data_object[0].yld;
				console.log(JSON.stringify(quote, true, '\t'))
				
				p_socket.emit('quote', PRETTY_PRINT_JSON ? JSON.stringify(quote, true, '\t') : JSON.stringify(quote));
				if (dbGlobal!=null) {
					insertNewDoc(quote.ticker,(new Date()).toString(),quote,dbGlobal,null);
				}
			}
		});
	});
}

var insertNewDoc=function(ticker,time,quote,db,callback){
	// db.collection(ticker).insertOne(null);
	var milliseconds = (new Date).getTime();
	// db.collection(ticker).insertOne({time:time});
	console.log(time);
	console.log(milliseconds);

	 var obj = {};
	  var colone1 = time;
    var colone2 = "epoch";

    obj[colone1] = quote;
    obj[colone2] = milliseconds;
    db.collection(ticker).insertOne(obj, function(err, result) {
        assert.equal(err, null);         
    });


	 // db.collection(ticker).insertOne({epoch:milliseconds});

}



var insertDocument = function(db, callback) {
	if (true) {return;}
   db.collection('companies').insertOne({
        "records": {
            "company Id": {
                "company name": "",
                "company ticker": "",
                "current price": 123,
                "updated at": 123231321,
                "currency": "$",
                "stock exchange": "",
                "stock record": {
                    "time ": 123.23,
                    "time 1": 145
                }
            },
             "company Id2": {
                "company name": "",
                "company ticker": "",
                "current price": 123,
                "updated at": 123231321,
                "currency": "$",
                "stock exchange": "",
                "stock record": {
                    "time ": 123.23,
                    "time 1": 145
                }
            }
        }

    }, function(err, result) {
    assert.equal(err, null);
    console.log("Inserted a document into the restaurants collection.");
    callback();
  });
};

var url = 'mongodb://localhost:27017/test';
var dbGlobal;

var MongoClient = require('mongodb').MongoClient;
MongoClient.connect(url, function(err, db) {
  assert.equal(null, err);
    console.log("Connected correctly to server");
    dbGlobal=db;
  // insertDocument(db, function() {
      // db.close();
  // });
});