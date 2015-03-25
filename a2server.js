var url = require('url');
var logger = require('morgan');

var socket = require('socket.io');
var express = require('express');
var http = require('http');
var pg = require('pg');
var bodyParser = require('body-parser');

var app = express();
var server = http.createServer(app);
var io = socket.listen(server);

var db = new pg.Client("postgres://nba6010:nba6010@web469.webfaction.com:5432/bryce_nba6010");
db.connect();

writeData = function(res, data) {
  var json = JSON.stringify(data);
  res.writeHead(200, {
    'content-type' : 'application/json',
    'content-length' : Buffer.byteLength(json)
  });
  res.end(json);
}
curry = function(func) {
  var applied = Array.prototype.slice.call(arguments, 1);
  return function() {
    var args = applied.concat(Array.prototype.slice.call(arguments));
    return func.apply(this, args);
  };
}

app.use(bodyParser.urlencoded({
  extended : true
}));

// Add headers
app.use(function(req, res, next) {

  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);

  // Pass to next layer of middleware
  next();
});

app.use('/js', express.static(__dirname + '/public/js'));
app.use('/css', express.static(__dirname + '/public/css'));
app.use('/fonts', express.static(__dirname + '/public/fonts'));
app.use('/images', express.static(__dirname + '/public/images'));

app.get('/EXECUTE', function(req, res) {
  console.log(req.query.QUERY);
  db.query(req.query.QUERY, function(err, result) {
    writeData(res, result.rows);
  });
});

app.get('/8b', function(req, res) {
  db.query('SELECT unit_id, unit_title, price, deposit FROM listings, owners WHERE owners.name=\'Terry Jones\' AND owners.owner_id=listings.owner_id AND listings.location=\'collegetown\'', function(err, result) {
    writeData(res, result.rows);
  });
});

app.get('/location-list', function(req, res) {

  db.query('SELECT DISTINCT location FROM listings', function(err, result) {
    writeData(res, result.rows);
  });
});

app.get('/owner-list', function(req, res) {

  db.query('SELECT owner_id, name FROM owners', function(err, result) {
    writeData(res, result.rows);
  });
});

app.get('/9', function(req, res) {
  console.log("params", req.query);
  var myQuery = '';
  if (req.query.location) {
    myQuery = "location='" + req.query.location + "'";
  }
  if (req.query.min_price) {
    if (myQuery != '') {

      myQuery += " AND ";
    }
    myQuery += " price>=" + req.query.min_price;
  }
  if (req.query.max_price) {
    if (myQuery != '') {

      myQuery += " AND ";
    }

    myQuery += " price<=" + req.query.max_price;
  }
  if (myQuery != '') {

    myQuery = " WHERE " + myQuery;
  }
  myQuery = 'SELECT * FROM listings ' + myQuery;

  console.log(myQuery);
  db.query(myQuery, function(err, result) {
    if (!result) {
      result = {};
      result.rows = [];
    }
    writeData(res, result.rows);
  });
});

app.post('/add-owner', function(req, res) {
  console.log(req.body);
  db.query('INSERT INTO owners (name, email) VALUES (\'' + req.query.name + '\',\'' + req.query.e - mail + '\'', function(err, result) {
    db.query('SELECT owner_id, name FROM owners WHERE name=\'' + req.query.name + '\'', function(err, result) {
      if (!result) {
        result = {};
        result.rows = [];
      }
      writeData(res, result.rows);
    });
  });
});

app.get('/a1.html', function(req, res) {
  res.sendFile(__dirname + '/public/a1.html');
});
app.get('/a2.html', function(req, res) {
  res.sendFile(__dirname + '/public/a2.html');
});

server.listen(26395);

