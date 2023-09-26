# aibookingagent-source

## Intro

This project used a Quickstart template provided by Nylas to get up and running quickly. You must start the backend first, and then the front end using npm start.

Also, you must include an Open AI key in your .env file and name it OPENAI_KEY.

To see this app online and try it out, visit https://aibookingagent.vercel.app

## AI Booking Agent

This app is designed for independent artists and bands, enabling them to book their own gigs. It includes a custom Venues API I designed to help find appropriate contact info for venues.

The artist simply inputs some information about their act, choose a venue from the dropdown to populate the "To" field, and let the app use generative AI to create a professional booking email.

When you're ready to send, the app uses Nylas to send the email and also adds a calendar date to the artist's primary calendar to act as a "hold". A "hold" is an industry term used for a date that has been requested, but has not yet been confirmed.

In essence, the app leverages its own Venues API, the Nylas Email and Calendar APIs, as well as OpenAI's GPT 3.5.
