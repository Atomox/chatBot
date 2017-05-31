require('dotenv').config();
var express = require('express'),
		request = require('request'),
		bodyParser = require('body-parser'),
		app = express();

var slackAuth = require('./slack-auth'),
		slackSlash = require('./slack-slash-cmd'),
		slackApi = require('./slack-api');

// Modules have, but don't need, "middle-men".
slackAuth = slackAuth.slackAuth;
slackApi = slackApi.slackApi;

var server = require('http').createServer(app);


app.use(express.static(__dirname + '/includes'));
app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 

app.get('/', function(req, resp, next) {
  console.log('Homepage time!');
//  resp.sendFile(__dirname + '/html/index.html');
	resp.send('Ngrok is working! Path Hit: ' + req.url);
});

server.listen('2021');


// This route handles get request to a /oauth endpoint. We'll use this endpoint for handling the logic of the Slack oAuth process behind our app.
app.get('/oauth', function(req, res) {
	slackAuth.oAuth(req, res);
});
app.get('/')

// Route the endpoint that our slash command will point to and send back a simple response to indicate that ngrok is working
app.post('/command', function(req, res) {

	console.log('Request to /command:'); // ,req);
  res.send('Hi Dad Soup!');
});

// Route the endpoint that our slash command will point to and send back a simple response to indicate that ngrok is working
app.post('/event-api', function(req, res) {
	console.log('Request to /event-api:');
	if (typeof req.body.type !== 'undefined' && req.body.type == 'url_verification') {
		slackAuth.urlVerify(req, res);
	}
	else {
		if (slackAuth.tokenVerify(req,res) === true) {
			// Acknowledge we received this request.
			res.send('We got it!');

			console.log(' > Parsing API....');
			slackApi.parseApi(req.body, res);
		}
		else {
			console.warn('Unverified request without token. Ignoring.');
		}
	}
});

/**
var Bot = require('slackbots');

// create a bot
var settings = {
    token: process.env.ClientID,
    name: 'My Bot'
};
var bot = new Bot(settings);

bot.on('start', function() {
    bot.postMessageToChannel('some-channel-name', 'Hello channel!');
    bot.postMessageToUser('some-username', 'hello bro!');
    bot.postMessageToGroup('some-private-group', 'hello group chat!');
});

*/