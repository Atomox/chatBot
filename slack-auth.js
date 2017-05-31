var slackAuth = (function slackAuthFactory() {

  function oAuth(req, res) {
    console.log('Auth Factory...');

    // When a user authorizes an app, a code query parameter is passed on the oAuth endpoint. If that code is not there, we respond with an error message
    if (!req.query.code) {
        res.status(500);
        res.send({"Error": "Looks like we're not getting code."});
        console.log("Looks like we're not getting code.");
    }
    else {
        // If it's there...

        // We'll do a GET call to Slack's `oauth.access` endpoint, passing our app's client ID, client secret, and the code we just got as query parameters.
        request({
            url: 'https://slack.com/api/oauth.access', //URL to hit
            qs: {
              code: req.query.code,
              client_id: process.env.Slack_ClientID,
              client_secret: process.env.Slack_ClientSecret}, //Query string data
            method: 'GET', //Specify the method

        }, function (error, response, body) {
            
            console.log('Auth Factory:');
            
            if (error) {
              console.log(error);
            }
            else {
              console.log(res);
              res.json(body);
              console.log(res.json(body));
            }
        });
    }
  }


  function tokenVerify(req, res) {
    try {
      if (typeof req.body === 'undefined'
        || typeof req.body.token === 'undefined') {
        throw new Error('Request requiring verification, but no body or auth token passed.');
      }
      // Check token matches our expected token.
      else if (process.env.Slack_VerifyToken != req.body.token) {
        console.log(process.env.Slack_VerifyToken, verify_token);
        throw new Error('Request urlVerify POST does not have matching auth verification token. Something might be malicious, or you may need to update your Verification Token in Slack, and this app configuration. Passed: ' + verify_token);
      }
    }
    catch (err) {
      console.warn(err);
      return false;
    }

    return true;
  }


  /**
   * Respond to a url verification request.
   *
   * @param  {obj} req
   *   The request object.
   * @param  {obj} res
   *   Our respnse object.
   *
   * @return {boolean}
   *   TRUE on success. Otherwise, FALSE.
   */
  function urlVerify(req, res) {
    try {
      if (typeof req.body === 'undefined'
        || typeof req.body.challenge === 'undefined') {
        throw new Error('Request urlVerify, but no body or challenge token.');
      }
      else if (tokenVerify(req,res) !== true) {
        throw new Error('Token verification failed. WIll not response to url verification request.');
      }
      var verify_challenge = req.body.challenge,
        verify_type = req.body.type;

      // Check and return challenge token.
      res.json({"challenge" : verify_challenge});
    }
    catch (err) {
      console.warn(err);
      return false;
    }

    return true;
  }

  return {
    oAuth: oAuth,
    urlVerify: urlVerify,
    tokenVerify: tokenVerify
  };

})();

module.exports = {
  slackAuth: slackAuth
};