// Minimal Telegram webhook on Netlify (Node.js)
exports.handler = async (event) => {
  try {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) {
      console.error("Missing TELEGRAM_BOT_TOKEN");
      return { statusCode: 500, body: "No token" };
    }

    const myTelegramId = parseInt(process.env.MY_TELEGRAM_ID, 10);

    const update = JSON.parse(event.body || "{}");
    console.log("Incoming update:", update);
    
    const msg = update.message || update.edited_message || update.channel_post;
    if (!msg) {
        return { statusCode: 200, body: JSON.stringify({ status: "ignored" }) };
    }
    
    const fromId = msg.from?.id;
    const chatId = msg.chat.id;
    const text = msg.text || "";
    console.log(fromId, myTelegramId);
    
    // ✅ Auth check
    if (fromId !== myTelegramId) {
      console.warn(`Unauthorized user: ${fromId}`);
      return { statusCode: 200, body: "Unauthorized user" };
    }

    const reply = text
      ? `Processed: ${text.split("").reverse().join("")}`
      : "No text provided";

    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text: reply })
    });

    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } catch (err) {
    console.error("Handler error:", err, "Raw body:", event.body);
    return { statusCode: 200, body: JSON.stringify({ ok: false }) };
  }
};
