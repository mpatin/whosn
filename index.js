var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var router = express.Router();

var AWS = require("aws-sdk");

AWS.config.update({ region: "us-east-1" });

var docClient = new AWS.DynamoDB.DocumentClient();

/** bodyParser.urlencoded(options)
 * Parses the text as URL encoded data (which is how browsers tend to send form data from regular forms set to POST)
 * and exposes the resulting object (containing the keys and values) on req.body
 */
app.use(bodyParser.urlencoded({
  extended: true
}));

/**bodyParser.json(options)
 * Parses the text as JSON and exposes the resulting object on req.body.
 */
app.use(bodyParser.json());

app.set('views', './src/views');
app.set('view engine', 'ejs');

app.get('/events', function(req, res) {

  var params = {
    TableName: "Events",
  };

  docClient.scan(params, onScan);

  function onScan(err, data) {
    if (err) {
      console.error("Unable to scan the table. Error JSON:", JSON.stringify(err, null, 2));
    } else {
      console.log("Scan succeeded.");
      var events = [];
      data.Items.forEach(function(event) {
        events.push(event);
      });
      res.render('eventsView', {
        events: events
      });
    }
  }
});

app.get('/events/:id', function(req, res) {

  var params = {
    TableName: "Events",
    Key: {
      "id": req.params.id
    }
  };

  docClient.get(params, function(err, data) {
    if (err) {
      console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
    } else {
      console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
      res.render('eventView', {
        event: data.Item
      });
    }
  });
});

app.post('/events/create', function(req, res) {
  console.log(req.body);
  var params = {
    TableName: "Events",
    Item: {
      "id": req.body.id,
      "name": req.body.name,
      "location": req.body.location,
      "time": req.body.time,
      "creator": req.body.creator,
      "participants": [{
        "name": req.body.creator,
        "io": "in"
      }]
    }
  };
  docClient.put(params, function(err, data) {
    if (err) {
      console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
    } else {
      console.log("Added item:", JSON.stringify(data, null, 2));
      res.redirect('/events');
    }
  });
});

app.post('/events/respond/:id', function(req, res) {
  var newResponse = {
    "name": req.body.name,
    "io": req.body.io,
    "comments": req.body.comments
  }
  var params = {
    TableName: 'Events',
    Key: {
      "id": req.params.id,
    },
    ReturnValues: 'ALL_NEW',
    UpdateExpression: 'set #participants = list_append(#participants, :newResponse)',
    ExpressionAttributeNames: {
      '#participants': 'participants'
    },
    ExpressionAttributeValues: {
      ':newResponse': [newResponse]
    }
  }

  console.log("Updating the item...");
  docClient.update(params, function(err, data) {
    if (err) {
      console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
    } else {
      console.log("UpdateItem succeeded:", JSON.stringify(data, null, 2));
      res.redirect('/events/'+req.params.id);
    }
  });
});


app.get('/', function(req, res) {
  res.render('indexView');
});

const port = 3000;

var server = app.listen(port, function() {
  console.log('Express is listening on port ' + port);
});
