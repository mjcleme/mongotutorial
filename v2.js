var fs = require('fs');
var http = require('http');
var url = require('url');
var readline = require('readline');
var ROOT_DIR = "html/";
http.createServer(function (req, res) {
  var urlObj = url.parse(req.url, true, false);
  console.log("URL path "+urlObj.pathname);
  console.log("URL search "+urlObj.search);
  console.log("URL query "+urlObj.query["q"]);
  // If this is our comments REST service
  if(urlObj.pathname.indexOf("comment") !=-1) {
    console.log("comment route");
    if(req.method === "POST") {
      console.log("POST comment route");
      // First read the POST data
      var jsonData = "";
      req.on('data', function (chunk) {
        console.log("Chunk: "+chunk);
	jsonData += chunk;
      });
      req.on('end', function () {
        console.log("end: "+jsonData);
        res.writeHead(200);
        res.end("<html><body><h1>Hello</h1></body></html>");
	var reqObj = JSON.parse(jsonData);
        console.log(reqObj);
	console.log("Name: "+reqObj.Name);
	console.log("Comment: "+reqObj.Comment);
        // Now put it into the database
        var MongoClient = require('mongodb').MongoClient;
        MongoClient.connect("mongodb://localhost/weather", function(err, db) {
          if(err) throw err;
          db.collection('comments').insert(reqObj,function(err, records) {
            console.log("Record added as "+records[0]._id);
          });
        });
      });
    }
  // If this is our city REST service
  } else if(urlObj.pathname.indexOf("getcity") !=-1) {
    var myRe = new RegExp("^"+urlObj.query["q"]);
    console.log(myRe);
    console.log("query is ",urlObj.query["q"]);
    var jsonresult = [];
    // Now look the query up in the file
    fs.readFile('cities.dat.txt', function (err, data) {
      if(err) throw err;
      cities = data.toString().split("\n");
      for(var i = 0; i < cities.length; i++) {
        var result = cities[i].search(myRe);
        if(result != -1) {
          console.log(cities[i]);
          jsonresult.push({city:cities[i]});
        }
      }
      console.log(jsonresult);
      console.log(JSON.stringify(jsonresult));
      res.writeHead(200);
      res.end(JSON.stringify(jsonresult));
    });
  } else {
    // Normal static file
    fs.readFile(ROOT_DIR + urlObj.pathname, function (err,data) {
      if (err) {
        res.writeHead(404);
        res.end(JSON.stringify(err));
        return;
      }
      res.writeHead(200);
      res.end(data);
    });
  }
}).listen(80);

