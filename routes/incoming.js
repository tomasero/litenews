var express = require('express');
var router = express.Router();

var newsArray = null;
var currentNews = null;
var newsCounter = 0;
var sentenceCounter = 0;

router.get('/incoming', function(req, res) {
    var keyword = req.body.Body.toLowerCase();
    if (keyword == 'more') {
        if (newsArray != null) {
            if (currentNews != null && sentenceCounter < currentNews.sentences.length) {
                var response = '<Response><Sms>' + currentNews.sentences[sentenceCounter] + '</Sms></Response>'; //.substring(0, 160)
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
            currentNews = news[newsCounter];
            var response = '<Response><Sms>' + currentNews.title + '</Sms></Response>';
            newsCounter++;
            res.send(response);
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

module.exports = router;

/**
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
**/