import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(
  process.env.SUPABASE_URL,
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

    // ========================
    // Command: /add
    // ========================
    if (text.startsWith("/add")) {
      const regex = /^\/add\s+(\S+)\s+(\d+)(?:\s+(\d+))?(?:\s+"([^"]+)")?$/;
      const match = text.match(regex);

      if (!match) {
        await sendMessage(
          token,
          chatId,
          "Format salah. Contoh:\n" +
          "/add kopi 15000\n" +
          "/add kopi 15000 2\n" +
          "/add kopi 15000 \"buat rapat\"\n" +
          "/add roti 7000 2 \"sarapan pagi\""
        );
        return { statusCode: 200, body: "invalid format" };
      }

      const item = match[1];
      const cost = parseInt(match[2], 10);
      const amount = match[3] ? parseInt(match[3], 10) : 1;
      const reason = match[4] || null;
      const total_cost = cost * amount;

      const { error } = await supabase
        .from("expenses")
        .insert([{ item, cost, amount, total_cost, reason }]);

      if (error) {
        console.error("DB error:", error);
        await sendMessage(token, chatId, "❌ Gagal menyimpan data.");
      } else {
        let response = `✅ Disimpan:\n📦 ${item}\n💰 ${cost}\n🔢 ${amount}\n💵 Total: ${total_cost}`;
        if (reason) response += `\n📝 ${reason}`;
        await sendMessage(token, chatId, response);
      }

      return { statusCode: 200, body: "ok" };
    }

    // ========================
    // Command: /list
    // ========================
    if (text.startsWith("/list")) {
      const { data, error } = await supabase
        .from("expenses")
        .select("id, item, cost, amount, total_cost, reason, created_at")
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) {
        console.error("DB error:", error);
        await sendMessage(token, chatId, "❌ Gagal mengambil data.");
      } else if (!data || data.length === 0) {
        await sendMessage(token, chatId, "📭 Belum ada transaksi.");
      } else {
        let response = "📒 5 transaksi terakhir:\n";
        data.forEach((row, i) => {
          response += `\n${i + 1}. ${row.item} - Rp${row.cost} x${row.amount} = Rp${row.total_cost}`;
          if (row.reason) response += `\n   📝 ${row.reason}`;
        });
        await sendMessage(token, chatId, response);
      }

      return { statusCode: 200, body: "ok" };
    }

    // ========================
    // Default
    // ========================
    await sendMessage(token, chatId, "❓ Perintah tidak dikenal.");
    return { statusCode: 200, body: "unknown command" };

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
