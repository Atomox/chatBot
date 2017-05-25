var request = require('request');

var slackApi = (function slackApiFactory() {


  function parseApi (body, res) {
    console.log('API Request: Body:', body);

    //Replace your token, channelID and text here
    var path_to_call = 'https://slack.com/api/chat.postMessage?'
      + 'token=' + process.env.Slack_VerifyToken
      + '&channel=' + body.event.channel
      + '&text=' + body.event.text;

    request(path_to_call, function(error, response, body) {
      if (!error && response.statusCode == 200) { 
        console.log(' > Sent chat.postMessage(). Success. Response: ', body);
      }
      else {
        console.log(error);
      }
    });

  }

  return {
    parseApi: parseApi
  };

})();

module.exports = {
  slackApi: slackApi
};