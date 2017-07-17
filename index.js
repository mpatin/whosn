var express = require('express');
var bodyParser = require('body-parser');
var randomstring = require('randomstring');
var nodemailer = require('nodemailer');
var app = express();
var router = express.Router();

var AWS = require('aws-sdk');

AWS.config.update({region: 'us-east-1'});

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

// check for static files (css, js, img) in assets directory
app.use(express.static('assets'));

app.set('views', './src/views');
app.set('view engine', 'ejs');

app.get('/events', function(req, res) {

  var params = {
    TableName: 'Events',
  };

  docClient.scan(params, onScan);

  function onScan(err, data) {
    if (err) {
      console.error('Unable to scan the table. Error JSON:', JSON.stringify(err, null, 2));
    } else {
      console.log('Scan succeeded.');
      var events = [];
      data.Items.forEach(function(event) {
        events.push(event);
      });
      console.log(events);
      res.render('eventsView', {
        events: events
      });
    }
  }
});

app.get('/events/:id', function(req, res) {

  var params = {
    TableName: 'Events',
    Key: {
      'id': req.params.id
    }
  };

  docClient.get(params, function(err, data) {
    if (err) {
      console.error('Unable to read item. Error JSON:', JSON.stringify(err, null, 2));
    } else {
      console.log('GetItem succeeded:', JSON.stringify(data, null, 2));
      res.render('singleEventView', {
        event: data.Item
      });
    }
  });
});

app.post('/events/create', function(req, res) {
  // *************************
  // need to add check here to make sure id doesn't already exist
  // *************************
  var id = randomstring.generate({
    length: 3,
    capitalization: 'lowercase'
  });

  var params = {
    TableName: 'Events',
    Item: {
      'id': id,
      'name': req.body.name,
      'location': req.body.location,
      'date': req.body.date,
      'time': req.body.hour + ':' + req.body.min + '' + req.body.ampm,
      'creator': req.body.creator,
      'participants': [{
        'name': req.body.creator,
        'io': 'In'
      }]
    }
  };
  docClient.put(params, function(err, data) {
    if (err) {
      console.error('Unable to add item. Error JSON:', JSON.stringify(err, null, 2));
    } else {
      console.log('Added item:', JSON.stringify(data, null, 2));
      res.redirect('/events');
    }
  });
});

app.post('/events/respond/:id', function(req, res) {
  console.log(req.body.comments);
  var newResponse;
  if (req.body.comments === '') {
    newResponse = {
      'name': req.body.name,
      'io': req.body.io
    };
  }
  else {
    newResponse = {
      'name': req.body.name,
      'io': req.body.io,
      'comments': req.body.comments
    };
  }

  var params = {
    TableName: 'Events',
    Key: {
      'id': req.params.id,
    },
    ReturnValues: 'ALL_NEW',
    UpdateExpression: 'set #participants = list_append(#participants, :newResponse)',
    ExpressionAttributeNames: {
      '#participants': 'participants'
    },
    ExpressionAttributeValues: {
      ':newResponse': [newResponse]
    }
  };

  console.log('Updating the item...');
  docClient.update(params, function(err, data) {
    if (err) {
      console.error('Unable to update item. Error JSON:', JSON.stringify(err, null, 2));
    } else {
      console.log('UpdateItem succeeded:', JSON.stringify(data, null, 2));
      res.redirect('/events/'+req.params.id);
    }
  });
});

app.get('/admin/:id', function(req, res) {

  var params = {
    TableName: 'Events',
    Key: {
      'id': req.params.id
    }
  };

  docClient.get(params, function(err, data) {
    if (err) {
      console.error('Unable to read item. Error JSON:', JSON.stringify(err, null, 2));
    } else {
      console.log('GetItem succeeded:', JSON.stringify(data, null, 2));
                        var transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                      user: 'whosn.mailer@gmail.com',
                      pass: 'Whosn51dfwn'
                    }
                  });

                  var mailOptions = {
                    from: 'whosn.mailer@gmail.com',
                    to: 'mitchell.patin@gmail.com',
                    subject: 'Sending Email using Node.js',
                    text: 'That was easy!'
                  };

                  transporter.sendMail(mailOptions, function(error, info){
                    if (error) {
                      console.log(error);
                    } else {
                      console.log('Email sent: ' + info.response);
                    }
                  });
      res.render('singleEventView', {
        event: data.Item
      });
    }
  });
});

app.get('/about', function(req, res) {
  res.render('aboutView');
});

app.get('/', function(req, res) {
  res.render('indexView');
});

var port = process.env.PORT || 3000;

var server = app.listen(port, function() {
  console.log('Express is listening on port ' + port);
});
