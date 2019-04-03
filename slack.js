const fetch = require('isomorphic-fetch');
const config = require('./config');

const clientId = config.SLACK_CLIENT_ID;
const clientSecret = config.SLACK_CLIENT_SECRET;
const TOKEN = config.SLACK_OAUTH_TOKEN;
//const channelId = config.CHANNEL_ID;

const authorise = code => {
  console.log(code);
  const data = {
    qs: {
      code: code,
      client_id: clientId,
      client_secret: clientSecret,
    },
  };

  fetch('https://slack.com/api/oauth.access', {
    method: 'GET',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then(result => result.json())
    .catch(err => {
      console.log(err);
      throw Error(err);
    });
};

const postMessage = (channelId, message) =>
  fetch(
    `https://slack.com/api/chat.postMessage?token=${TOKEN}&channel=${channelId}&text=${encodeURIComponent(
      message
    )}&pretty=1`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

const channelsHistory = channelId =>
  fetch(
    `https://slack.com/api/channels.history?token=${TOKEN}&channel=${channelId}&pretty=1`
  ).then(result => {
    return result.json();
  });

const apiResponse = message =>
  fetch(
    `https://huic.serveo.net/journalist/${encodeURIComponent(message)}`
  ).then(result => {
    //console.log(result.json());
    return result.json();
  });

const twitterResponse = search =>
  fetch(`http://95251f58.ngrok.io/match/${search}`).then(result => {
    //console.log(result.json());
    return result.json();
  });

module.exports = {
  authorise,
  postMessage,
  channelsHistory,
  apiResponse,
  twitterResponse,
};
