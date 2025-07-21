// netlify/functions/usercount.js
const { MongoClient } = require('mongodb');
const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  const mongoUri = "mongodb+srv://moisesgamer1029:B5f0BiVGPGaCx3Yk@cluster0.qfl4uis.mongodb.net/mautdb?retryWrites=true&w=majority";
  const botToken = "8179419889:AAE1Jq_OSXWKU18cmQay0BDX-gisnuGrPHk";
  const chatId = "7749463094";

  const client = new MongoClient(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
    await client.connect();
    const db = client.db("mautdb");
    const users = db.collection("users");

    await users.insertOne({ visitedAt: new Date() });

    const count = await users.countDocuments();

    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage?chat_id=${chatId}&text=🎉 New user joined: ${count}`);

    return { statusCode: 200, body: JSON.stringify({ success: true, count }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  } finally {
    await client.close();
  }
};
