//import OpenAI from 'openai';
const { Configuration, OpenAIApi, OpenAI } = require("openai");
const dotenv = require('dotenv');
dotenv.config({ path: __dirname + "/../.env" });

const openai = new OpenAI({
    apiKey: process.env.OPENAI_KEY, // defaults to process.env["OPENAI_API_KEY"]
});

class GenerativeAI {
    async generateEmailToSend(theAIPrompt) {
        const chatCompletion = await openai.chat.completions.create({
            messages: [{ role: 'user', content: theAIPrompt }],
            model: 'gpt-3.5-turbo',
        });
        
        console.log(chatCompletion.choices);
        return chatCompletion.choices;
    }
}

const generativeAI = new GenerativeAI;
module.exports = generativeAI;

//this.generateEmailToSend("Write an email as an entertainment booking agent for a band called The Goo Boys who seek to book a show at The Tiger Room");