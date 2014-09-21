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
var commands = ['more', 'help', 'link', 'list', 'reset', 'topics'];
var topics = ['tech', 'world'];

app.post('/incoming', function(req, res) {
    var keyword = req.body.Body.toLowerCase();
    if (!isNaN(keyword)) {
        var response = '';
        if (newsArray != null) {
            var index = Number(keyword);
            if (index > 0 && index <= newsArray.length) {
                currentNews = newsArray[index-1];
                response = getMoreInfo(currentNews.sentences);
            } else {
                response = toSMS('Number outside range');
            }
        } else {
            response = toSMS('Select a news topic first!');
        }
        res.send(toResponse(response));
    } else if (keyword == '?') {
        var response = '';
        for (var i = 0; i < commands.length; i++) {
            response = response + commands[i] + '\n';
        }
        res.send(toResponse(toSMS(response)));
    } else if (keyword == 'topics') {
        var response = '';
        for (var i = 0; i < topics.length; i++) {
            response = response + topics[i] + '\n';
        }
        res.send(toResponse(toSMS(response)));       
    } else if (keyword == 'link') {
        var response = '';
        if (newsArray != null) {
            if (currentNews != null) {
                    response = toSMS(currentNews.url);
            } else {
                response = toSMS('Select a headline index');
            }
        } else {
            response = toSMS('Select a news topic first!');
        }
        res.send(toResponse(response));
    } else if (keyword == 'list') {
        var response = '';
        if (newsArray != null) {
            currentNews = null;
            response = getHeadlines(newsArray);
        } else {
            response = toSMS('Select a news topic first!');
        }
        res.send(toResponse(response));
    } else if (keyword == 'tech' || keyword == 'world' || keyword == 'business') {
        var url = 'http://bitofnews.com/api/'+keyword+'/';
        restler.get(url, { parser: restler.parsers.json }).on('complete', function(news) {
            newsArray = news;
            var response = getHeadlines(newsArray);
            res.send(toResponse(response));
        });
    } else {
        var response = toSMS('We can\'t find news about that topic');
        res.send(toResponse(response));
    }
});

function getHeadlines(array) {
    var output = '';
    for (var i = 0; i < array.length; i++) {
        var index = i+1;
        var response = toSMS('[' + index + '] ' + array[i].title);
        output += response;
    }
    return output;
}

function getMoreInfo(sentences) {
    var output = '';
    for (var i = 0; i < sentences.length; i++) {
        var index = i+1;
        var response = toSMS('[' + index  + '/' + sentences.length+ '] ' + sentences[i]);
        output += response;
    }
    return output;
}

function toSMS(text) {
    var output = '<Sms>' + text + '</Sms>';
    return output;
}

function toResponse(text) {
    var output = '<Response>' + text + '</Response>';
    return output;
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
