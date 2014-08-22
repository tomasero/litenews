var sys = require('sys');
var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var restler = require('restler');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);
/**
app.post('/incoming', function(req, res) {
    var keyword = req.body.Body.toLowerCase();
    var from = req.body.From;
    feedContent(from, keyword);
    res.end();
});
**/

    var newsArray = null;
    var currentNews = null;
    var newsCounter = 0;
    var sentenceCounter = 0;

app.post('/incoming', function(req, res) {
    var keyword = req.body.Body.toLowerCase();
    if (keyword == 'more') {
        sentenceCounter++;
        if (newsArray != null) {
            if (currentNews != null && sentenceCounter < currentNews.length) {
                var response = '<Response><Sms>' + currentNews.sentences[sentenceCounter] + '</Sms></Response>';
                res.send(response);
            } else {
                res.send('<Response><Sms>' + currentNews + '</Sms></Response>');
                sentenceCounter = 0;
                var response = '<Response><Sms>Try writing \'next\' or a new topic</Sms></Response>';
                res.send(response);
            }
        } else {
            var response = '<Response><Sms>No current news, do a new search!</Sms></Response>';
            res.send(response);
        }
    } else if (keyword == 'tech' || keyword == 'world' | keyword == 'business') {
        var url = 'http://bitofnews.com/api/'+keyword+'/';
        restler.get(url, { parser: restler.parsers.json }).on('complete', function(news) {
            newsArray = news;
            currentNews = news[0];
            var response = '<Response><Sms>' + currentNews.sentences[0] + '</Sms></Response>';
            res.send(response);
        });
    } else if (keyword == 'next') {
        newsCounter++;
        if (newsArray != null) {
            if (newsCounter < newsArray.length) {
                currentNews = newsArray[newsCounter];
                var response = '<Response><Sms>' + currentNews.sentences[0] + '</Sms></Response>';
                res.send(response);
            } else {
                newsArray = null;
                currentNews = null;
                newsCounter = 0;
                sentenceCounter = 0;
                var response = '<Response><Sms>No more news, try a new topic</Sms></Response>';
                res.send(response);
            }
        } else {
            var response = '<Response><Sms>No current news, do a new search!</Sms></Response>';
            res.send(response);
        }
    } else {
        var response = '<Response><Sms>We can\'t find news about that topic</Sms></Response>';
        res.send(response);
    }
});

// Load the twilio module
var twilio = require('twilio');
var http = require('http');
 
// Twilio Credentials 
var accountSid = 'ACf3e2774672baa3f68d9b80591c6667df'; 
var authToken = 'e49c5b02c1f7df6cbe21a05b4ec21ee1'; 

// Create a new REST API client to make authenticated requests against the
// twilio back end
//var client = new twilio.RestClient(accountSid, authToken);
var client = require('twilio')(accountSid, authToken);
 
// Pass in parameters to the REST API using an object literal notation. The
// REST client will handle authentication and response serialzation for you.
function sendNews(phone, message) {
    client.sendSms({
        to: phone, //my own phone number
        from: '+1 510-900-8110', //twilio number
        body: message
    }, function(error, message) {
        if (!error) {
            console.log('Success! The SID for this SMS message is:');
            console.log(message.sid);
            console.log('Message sent on:');
            console.log(message.dateCreated);
        } else {
            console.log('Oops! There was an error.');
            console.log(error);
        }
    });
}

function respondNews(res, message) {
    var resp = new twilio.TwimlResponse();
    resp.message(message);
    res.type('text/xml');
    console.log(resp.toString());
    return res.send(resp.toString());
}

function getNews(phone, keyword) {
    console.log(keyword);
    var url = 'http://bitofnews.com/api/'+keyword+'/';
    http.get(url, function(response) {
        var out = "";
        response.setEncoding('utf8');
        response.on('data', function(data) {
            out+=data;
        });
        response.on('error', console.error);
        response.on('end', function() {
            console.log('end');
            var firstNews = JSON.parse(out)[0];
            var title = firstNews.title;
            var message = firstNews.sentences[0].substring(0, 160);
            console.log(message);
            sendNews(phone, message);
        });
    });
}

function feedContent(phone, keyword) {
    console.log('feedContent');
    //return getNews(res, keyword);
    getNews(phone, keyword);
}

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

var port = Number(process.env.PORT || 5000);
app.listen(port, function() {
  console.log("Listening on " + port);
});

module.exports = app;
