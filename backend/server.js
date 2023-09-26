const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mockDb = require('./utils/mock-db');
const generativeAI = require('./services/generative-ai');

const { default: Event } = require('nylas/lib/models/event');
const Nylas = require('nylas');
const { WebhookTriggers } = require('nylas/lib/models/webhook');
const { Scope } = require('nylas/lib/models/connect');
const { default: Draft } = require('nylas/lib/models/draft');
const { openWebhookTunnel } = require('nylas/lib/services/tunnel');



dotenv.config();

const app = express();

// Enable CORS
app.use(cors());

// The port the express app will run on
const port = 9000;

// Initialize the Nylas SDK using the client credentials
Nylas.config({
  clientId: process.env.NYLAS_CLIENT_ID,
  clientSecret: process.env.NYLAS_CLIENT_SECRET,
  apiServer: process.env.NYLAS_API_SERVER,
});

// Before we start our backend, we should register our frontend
// as a redirect URI to ensure the auth completes
const CLIENT_URI =
  process.env.CLIENT_URI || `http://localhost:${process.env.PORT || 3000}`;
Nylas.application({
  redirectUris: [CLIENT_URI],
}).then((applicationDetails) => {
  console.log(
    'Application registered. Application Details: ',
    JSON.stringify(applicationDetails, undefined, 2)
  );
});

// Start the Nylas webhook
openWebhookTunnel({
  // Handle when a new message is created (sent)
  onMessage: function handleEvent(delta) {
    switch (delta.type) {
      case WebhookTriggers.MessageCreated:
        console.log(
          'Webhook trigger received, message created. Details: ',
          JSON.stringify(delta.objectData, undefined, 2)
        );
        break;
    }
  },
}).then((webhookDetails) =>
  console.log('Webhook tunnel registered. Webhook ID: ' + webhookDetails.id)
);

// '/nylas/generate-auth-url': This route builds the URL for
// authenticating users to your Nylas application via Hosted Authentication
app.post('/nylas/generate-auth-url', express.json(), async (req, res) => {
  const { body } = req;

  const authUrl = Nylas.urlForAuthentication({
    loginHint: body.email_address,
    redirectURI: (CLIENT_URI || '') + body.success_url,
    scopes: [Scope.EmailModify, Scope.EmailSend, Scope.Calendar],
  });

  return res.send(authUrl);
});

// '/nylas/exchange-mailbox-token': This route exchanges an authorization
// code for an access token
// and sends the details of the authenticated user to the client
app.post('/nylas/exchange-mailbox-token', express.json(), async (req, res) => {
  const body = req.body;

  const { accessToken, emailAddress } = await Nylas.exchangeCodeForToken(
    body.token
  );

  // Normally store the access token in the DB
  console.log('Access Token was generated for: ' + emailAddress);

  // Replace this mock code with your actual database operations
  const user = await mockDb.createOrUpdateUser(emailAddress, {
    accessToken,
    emailAddress,
  });

  // Return an authorization object to the user
  return res.json({
    id: user.id,
    emailAddress: user.emailAddress,
  });
});

// Middleware to check if the user is authenticated
async function isAuthenticated(req, res, next) {
  if (!req.headers.authorization) {
    return res.status(401).json('Unauthorized');
  }

  // Query our mock db to retrieve the stored user access token
  const user = await mockDb.findUser(req.headers.authorization);

  if (!user) {
    return res.status(401).json('Unauthorized');
  }

  // Add the user to the response locals
  res.locals.user = user;

  next();
}

// Add some routes for the backend
app.post(
  '/nylas/send-email',
  isAuthenticated,
  express.json(),
  async (req, res) => {
    const {
      body: { to, body, subject, venueName, formattedDate },
    } = req;

    const user = res.locals.user;

    let emailWithTags = body;
    emailWithTags = emailWithTags.replace(/\r\n\r\n/g, "</p><p>").replace(/\n\n/g, "</p><p>");
    emailWithTags = emailWithTags.replace(/\r\n/g, "<br />").replace(/\n/g, "<br />");

    console.log('Email body '+emailWithTags);

    
    // Send email

    const draft = new Draft(Nylas.with(user.accessToken));

    draft.to = [{ email: to }];
    draft.body = emailWithTags;
    draft.subject = subject;
    draft.from = [{ email: user.emailAddress }];

    const message = await draft.send();

    

    // Create calendar event

    const nylas = Nylas.with(user.accessToken);


    let calList = [];
    calList = await nylas.calendars.list();
    //console.log(calList);

    const primaryCalendar = calList.find(calendar => calendar.isPrimary === true);

    console.log(primaryCalendar);

    

    const event = new Event(nylas);

    //event.calendarId = calendarId;
    console.log('Calendar ID: '+primaryCalendar.id);
    event.calendarId = primaryCalendar.id;
    event.title = "Hold date at "+venueName;
    event.description = "This is a hold.";
    event.when.date = formattedDate;
    

    event.save();

    return res.json({ message });
    



  }
);


app.post(
  '/nylas/generateAIEmail',
  //isAuthenticated,
  express.json(),
  async (req, res) => {
    const {
      body: { bandName, venueName, preferredDate, description, epkLink },
    } = req;

    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const newDateObj = new Date(preferredDate);
    const englishDate = newDateObj.toLocaleDateString('en-US', options);

    const theAIResponse = await generativeAI.generateEmailToSend('You are a booking agent that obtains gigs for independent bands. Write an email body to the venue owner (without a subject line) in order to book the band '+bandName+' on '+englishDate+'. '+bandName+' is '+description+'. This artist is seeking to perform at a venue called '+venueName+'. Fill in all the blanks in the email. Do not leave variables in the message. Do not include the Subject line. Use the following link and insert it somewhere in the email for the EPK (Electronic Press Kit): '+epkLink );

    return res.json({ theAIResponse });
    //return res.json({ 'message':'okay' });
  }
);


// Start listening on port 9000
app.listen(port, () => console.log('App listening on port ' + port));
