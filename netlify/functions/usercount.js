const { MongoClient } = require("mongodb");

const uri = "mongodb+srv://moisesgamer1029:B5f0BiVGPGaCx3Yk@cluster0.qfl4uis.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri);
const dbName = "appdata";

exports.handler = async (event) => {
  const ip = event.headers["x-forwarded-for"]?.split(",")[0]?.trim() || "unknown";

  try {
    await client.connect();
    const db = client.db(dbName);
    const users = db.collection("users");
    const log = db.collection("log");

    const alreadyExists = await users.findOne({ ip });

    if (alreadyExists) {
      // Same IP — no new count, no Telegram message
      return {
        statusCode: 200,
        body: JSON.stringify({ message: "IP already counted", ip }),
      };
    }

    // 🆕 New IP — insert and count
    await users.insertOne({ ip, date: new Date() });

    const total = await users.countDocuments();

    // ✅ Format Telegram message
    const message = `New user joined: ${total}\nNew ip - ${ip}`;

    const botToken = "8179419889:AAE1Jq_OSXWKU18cmQay0BDX-gisnuGrPHk";
    const chatId = "7749463094";
    const tgUrl = `https://api.telegram.org/bot${botToken}/sendMessage?chat_id=${chatId}&text=${encodeURIComponent(message)}`;

    await fetch(tgUrl);

    await log.insertOne({ ip, count: total, time: new Date() });

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "New IP counted", ip, total }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  } finally {
    await client.close();
  }
};
