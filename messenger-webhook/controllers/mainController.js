require("dotenv").config({ path: "../.env" });
const request = require("request");

const mainController = {
  homePage: async (req, res) => {
    return res.send("Hello world");
  },
  getWebHook: async (req, res) => {
    // Your verify token. Should be a random string.
    let VERIFY_TOKEN = process.env.MY_VERIFY_TOKEN;

    // Parse the query params
    let mode = req.query["hub.mode"];
    let token = req.query["hub.verify_token"];
    let challenge = req.query["hub.challenge"];

    // Checks if a token and mode is in the query string of the request
    if (mode && token) {
      // Checks the mode and token sent is correct
      if (mode === "subscribe" && token === VERIFY_TOKEN) {
        // Responds with the challenge token from the request
        console.log("WEBHOOK_VERIFIED");
        res.status(200).send(challenge);
      } else {
        // Responds with '403 Forbidden' if verify tokens do not match
        res.sendStatus(403);
      }
    }
  },
  postWebHook: async (req, res) => {
    let body = req.body;

    // Checks this is an event from a page subscription
    if (body.object === "page") {
      body.entry.forEach(function (entry) {
        // Gets the body of the webhook event
        let webhook_event = entry.messaging[0];
        console.log(webhook_event);

        // Get the sender PSID
        let sender_psid = webhook_event.sender.id;
        console.log("Sender PSID: " + sender_psid);

        // Check if the event is a message or postback and
        // pass the event to the appropriate handler function
        if (webhook_event.message) {
          handleMessage(sender_psid, webhook_event.message);
        } else if (webhook_event.postback) {
          handlePostback(sender_psid, webhook_event.postback);
        }
      });

      // Returns a '200 OK' response to all requests
      res.status(200).send("EVENT_RECEIVED");
    } else {
      // Returns a '404 Not Found' if event is not from a page subscription
      res.sendStatus(404);
    }

    // Handles messages events
    function handleMessage(sender_psid, received_message) {
      let response;

      // Check if the message contains text
      if (received_message.text == "Comment vas-tu ?") {
        response = {
          text: "Très bien et vous ?",
          quick_replies: [
            {
              content_type: "text",
              title: "Je vais bien, merci",
              payload: "yes",
            },
            {
              content_type: "text",
              title: "Non, ça ne va pas",
              payload: "no",
            },
          ],
          // attachment: {
          //   type: "template",
          //   payload: {
          //     template_type: "generic",
          //     elements: [
          //       {
          //         title: "Très bien et vous ?",
          //         subtitle: "Appuyez sur un bouton pour répondre.",
          //         buttons: [
          //           {
          //             type: "postback",
          //             title: "Je vais bien, merci",
          //             payload: "yes",
          //           },
          //           {
          //             type: "postback",
          //             title: "Non, ça ne va pas",
          //             payload: "no",
          //           },
          //         ],
          //       },
          //     ],
          //   },
          // },
        };
      } else if (received_message.text == "Je vais bien, merci") {
        response = { text: "Génial, je suis heureux de le savoir ! 😀" };
      } else if (received_message.text == "Non, ça ne va pas") {
         response = {
           attachment: {
             type: "template",
             payload: {
               template_type: "generic",
               elements: [
                 {
                   title: "Oh non, j'en suis désolé...",
                   image_url:
                     "https://media3.giphy.com/media/ftNHK91P3szl3tQr90/giphy-downsized-large.gif",
                 },
               ],
             },
           },
         };
      } else if (received_message.attachments) {
        // if the received messsage contains an image, the bot sends back an error message
        response = {
          text: "Je ne sais pas traiter ce type de demande",
        };
      } else {
        // Create the payload that send back the received message
        response = {
          text: `${received_message.text}`,
        };
      }

      // Sends the response message
      callSendAPI(sender_psid, response);
    }

    function callSendAPI(sender_psid, response) {
      // Construct the message body
      let request_body = {
        recipient: {
          id: sender_psid,
        },
        message: response,
      };

      // Send the HTTP request to the Messenger Platform
      request(
        {
          uri: "https://graph.facebook.com/v14.0/me/messages",
          qs: { access_token: process.env.PAGE_ACCESS_TOKEN },
          method: "POST",
          json: request_body,
        },
        (err, res, body) => {
          if (!err) {
            console.log("message sent!");
          } else {
            console.error("Unable to send message:" + err);
          }
        }
      );
    }
    // to handle the answer to the "très bien et vous ?" response of the bot
    // function handlePostback(sender_psid, received_postback) {
    //   let response;

    //   // Get the payload for the postback
    //   let payload = received_postback.payload;

    //   // Set the response based on the postback payload
    //   if (payload === "yes") {
    //     response = { text: "Génial, je suis heureux de le savoir ! 😀" };
    //   } else if (payload === "no") {
    //     response = {
    //       attachment: {
    //         type: "template",
    //         payload: {
    //           template_type: "generic",
    //           elements: [
    //             {
    //               title: "Oh non, j'en suis désolé...",
    //               image_url:
    //                 "https://media3.giphy.com/media/ftNHK91P3szl3tQr90/giphy-downsized-large.gif",
    //             },
    //           ],
    //         },
    //       },
    //     };
    //   }
    //   // Send the message to acknowledge the postback
    //   callSendAPI(sender_psid, response);
    // }
  },
};

module.exports = mainController;
