const {
  authorise,
  postMessage,
  channelsHistory,
  apiResponse,
  twitterResponse,
} = require('./slack');
const config = require('./config.json');
const queryString = require('query-string');
const fetch = require('isomorphic-fetch');

module.exports.start = async (event, context, callback) => {
  callback(null, {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: 'Where would you like to send an FOI',
  });
};

module.exports.history = async (event, context, callback) => {
  const {
    token,
    event: { user, text, ts, channel, event_ts, type, subtype, bot_id },
    authed_users,
  } = JSON.parse(event.body);

  if (type !== 'message' || subtype === 'message_deleted') {
    return;
  }

  //if the message is from a bot
  if (bot_id) return;

  const messageHistory = await channelsHistory(channel);

  const timesSent = messageHistory.messages.filter(
    message => message.text === text
  );

  // const sections = (name, subjects, email, country, expertise) => {
  //   return (
  //     {
  //       type: 'divider',
  //     },
  //     {
  //       type: 'section',
  //       block_id: 'section567',
  //       text: {
  //         type: 'mrkdwn',
  //         text: `name: *${name}*\n country: *${country}*\n subjects: *${subjects}*\n expertise: *${expertise}*\n email: ${email}\n`,
  //       },
  //     }
  //   );
  // };

  if (timesSent.length == 1) {
    const response = await apiResponse(text);

    if (!response) {
      const twitterSearch = await twitterResponse(text.split(' ')[0]);
      console.log(twitterSearch);

      //get the twitter response
      await postMessage(
        channel,

        `Unfortunately we were not able to find anybody, you might want to contact:

        *The Movement for Freedom of Information @nKoreaActivist*

        *The Alternative Information Center @koreansForTruth*

        Who work on freedom on information in North Korea, according to analysis of Twitter data.`
      );
    }

    await postMessage(
      channel,

      'We have found: ' +
        response.map(
          res => `\nname: *${res.name}*
       with expertise in:  *${res.skills}*
       subjects of interests: *${res.subjects}*
       from:  *${res.nationality}*
       email: ${res.email}\n`
        )
    );

    // await postMessage('CHABMV84C', [
    //   {
    //     type: 'section',
    //     text: {
    //       type: 'mrkdwn',
    //       text: 'Here is what we found:',
    //     },
    //   },

    //   sections(
    //     response[0].name,
    //     response[0].subjects,
    //     response[0].email,
    //     response[0].nationality,
    //     response[0].skills
    //   ),

    //   // response.map(res =>
    //   //   sections(res.name, res.subjects, res.email, res.nationality, res.skills)
    //   // ),
    // ]);
  }

  return {
    statusCode: 200,
    body: 'success',
  };
};

module.exports.oauth = async (event, context) => {
  try {
    if (!event.queryStringParameters.code) throw Error;

    await authorise(event.queryStringParameters.code);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'succesfully authorised' }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: err }),
    };
  }
};
