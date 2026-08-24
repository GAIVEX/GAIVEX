export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // ১. যখন /chat পাথে রিকোয়েস্ট আসবে (AI চ্যাটের জন্য)
    if (url.pathname === "/chat") {
      if (request.method !== "POST") {
        return new Response("Method not allowed", { status: 405 });
      }

      try {
        const body = await request.json();
        const userMessage = body.message;

        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${env.GEMINI_API_KEY}`;

        const response = await fetch(geminiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: `তুমি এই কোচিং সেন্টারের এআই অ্যাসিস্ট্যান্ট। শিক্ষার্থীদের প্রশ্নের উত্তর দাও: ${userMessage}` }]
              }
            ]
          })
        });

        const data = await response.json();

        // এপিআই কি বা জেমিনির ত্রুটি থাকলে তা হ্যান্ডেল করা
        if (data.error) {
          return new Response(JSON.stringify({ error: data.error.message }), {
            status: 400,
            headers: { "Content-Type": "application/json" }
          });
        }

        const aiReply = data.candidates?.[0]?.content?.parts?.[0]?.text || "দুঃখিত, এই মুহূর্তে উত্তর দিতে পারছি না।";

        return new Response(JSON.stringify({ reply: aiReply }), {
          headers: { "Content-Type": "application/json" }
        });

      } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { "Content-Type": "application/json" }
        });
      }
    }

    // ২. ওয়েবসাইট রিলেটেড বাকি সব ফাইলের (HTML, CSS, JS) জন্য static assets রিটার্ন করবে
    return env.ASSETS.fetch(request);
  }
};
