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
        if (newsArray != null) {
            if (currentNews != null && sentenceCounter < currentNews.sentences.length) {
                var response = '<Response><Sms>' + currentNews.sentences[sentenceCounter] + '</Sms></Response>';
                sentenceCounter++;
                res.send(response);
            } else {
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
            var output = '<Response>';
            for (var i = 0; i < newsArray.length; i++) {
                var response = '<Sms>[' + i + '] ' + newsArray[i].title + '</Sms>';
                output += response;
            }
            res.send(output + '</Response>');
        });
    } else if (keyword == 'next') {
        sentenceCounter = 0;
        if (newsArray != null) {
            if (newsCounter < newsArray.length) {
                currentNews = newsArray[newsCounter];
                var response = '<Response><Sms>' + currentNews.title + '</Sms></Response>';
                newsCounter++;
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
