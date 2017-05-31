var request = require('request');
var bueller = require('./ferris-bueller-quotes.js');
var apiai = require('apiai');

var slackApi = (function slackApiFactory() {


  function parseApi (body, res) {

    if (typeof body.event.bot_id !== 'undefined') {
      console.log(' < < Bot Chatter from ' + body.event.username + '. Ignoring > >');
      return;
    }

    // Determine if this was a tarageted message.
    console.log(' > From: ', body.event.user, ', in room: ', body.event.channel, ', at time: ', body.event.ts);
    console.log(' > ', body.event.text);

    getResponse(body.event.username, body.event.text, body.event.event_ts)
    .then(function(my_response) {

      // Replace your token, channelID and text here
      var path_to_call = 'https://slack.com/api/chat.postMessage?'
        + 'token=' + process.env.Slack_oAuth_botUserToken
        + '&channel=' + body.event.channel
        + '&text=' + my_response;
      request(path_to_call, function(error, response, body) {
        if (!error && response.statusCode == 200) {
          // console.log(' > Sent chat.postMessage(). Success. Response: ', body);
        }
        else {
          console.log(error);
        }
      });
    });
  }


  function getApiAiResponse(text, session_id) {

    var api_promise = new Promise(function(resolve, reject) {

      var app = apiai(process.env.ApiAi_ClientAccessToken),
          request = app.textRequest(text, {sessionId: session_id});

      request.on('response', function(response) {
        resolve(response);
      });
      request.on('error', function(error) {
        console.warn(error);
        reject(error);
      });
      request.end();
    });

    return api_promise;
  }


  function getResponse(user, text, timestamp) {

    var session_uuid = user + timestamp;
    var responsePromise = new Promise(function(resolve, reject) {
      getApiAiResponse(text,session_uuid)
      .then(function(result) {

        // Make sure result.session_id matches the one we passed.
        if (session_uuid != result.sessionId) {
          console.warn(' > Response ID does not match passed session ID: ', session_uuid, ' | ', result.sessionId);
          reject("Session ID doesn't match passess ID. Ignoring response.");
        }

        if (typeof result.result.metadata.intentName !== 'undefined') {
          console.log('Identified Action <<<', result.result.metadata.intentName, '>>>');
          console.log('Parameters:', result.result.parameters);
        }
        else {
          console.warn('<!> No intent found in query. <!>');
        }

        if (result.result.metadata.intentName == 'fetch.trivia') {
          text = getTriviaResponse(
            result.result.parameters.Source,
            result.result.parameters.item,
            result.result.parameters.Character
          );
        }

        resolve(text);
      });
    });

    return responsePromise;
  }


  function getTriviaResponse(source, item, character) {

    var response = false;

    switch (source) {
      case 'Ferris Bueller\'s Day Off':
        console.log(' >>> Requesting Ferris Bueller Trivia!');
        response = getBuellerTrivia(item, character);
        break;

      case 'MTA':
        console.log(' >>> Requesting Subway Trivia!');
        break;

      default:
        console.log(' >>> Could not identify intent for: ', source);
    }

    if (response !== false) {
      return '```' + response + '```';
    }

    return false;
  }


  function getBuellerTrivia(item, character) {
    if (['ferris', 'cameron', 'sloane', 'jeanie', 'simone', 'bueller', 'everyone', 'random'].indexOf(character.toLowerCase()) >= 0) {
      var key = '';

      console.log('Dispense a Bueller Bot fact!');
      switch (character.toLowerCase()) {
        case 'ferris':
        case 'bueller':
          key = 'ferris';
          break;

        case 'jeannie':
          key = 'jeannie';
          break;

        case 'sloane':
          key = 'sloane';
          break;

        case 'cameron':
          key = 'cameron';
          break;

        case 'everyone':
        case 'random':
          key = 'everyone';
          break;

        default:
          key = 'everyone';
      }
      console.log(bueller[key]);
      var index = Math.floor(Math.random() * (bueller[key].length));

      return bueller[key][index];
    }

    return false;
  }

  return {
    parseApi: parseApi
  };

})();

module.exports = {
  slackApi: slackApi
};