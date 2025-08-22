import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://rmxgcafscmvdpkjalbca.supabase.co',
  process.env.SUPABASE_ANON_KEY
);

export async function handler(event) {
  try {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const myId = parseInt(process.env.MY_TELEGRAM_ID, 10);

    const update = JSON.parse(event.body || "{}");
    const msg = update.message;
    if (!msg) return { statusCode: 200, body: "ignored" };

    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const text = msg.text || "";

    // Auth check
    if (userId !== myId) {
      await sendMessage(token, chatId, "🚫 Unauthorized user");
      return { statusCode: 200, body: "unauthorized" };
    }

    // Command parsing
    const match = text.match(/^\/add\s+(.+)\s+(\d+)\s+(\d+)$/i);
    if (!match) {
      await sendMessage(token, chatId, "Format salah. Gunakan: /add <item> <harga>");
      return { statusCode: 200, body: "invalid format" };
    }

    const item = match[1];
    const cost = parseInt(match[2], 10);
    let amount = 1;
    if (match[3]) {
      amount = parseInt(match[3], 10);
    } 
    const total_cost = cost * amount;

    // Save to Supabase
    const { error } = await supabase
      .from("expenses")
      .insert([{ item, cost, amount, total_cost}]);

    if (error) {
      console.error("DB error:", error);
      await sendMessage(token, chatId, "❌ Gagal menyimpan data.");
    } else {
      await sendMessage(token, chatId, `✅ Data disimpan: ${item} - Rp${total_cost}`);
    }

    return { statusCode: 200, body: "ok" };
  } catch (err) {
    console.error("Handler error:", err);
    return { statusCode: 500, body: "error" };
  }
}

async function sendMessage(token, chatId, text) {
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text })
  });
}
