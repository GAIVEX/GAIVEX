export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === "/chat") {
      if (request.method !== "POST") {
        return new Response(JSON.stringify({ error: "Method not allowed" }), {
          status: 405,
          headers: { "Content-Type": "application/json" }
        });
      }

      try {
        const body = await request.json();
        const userMessage = body.message;

        if (!userMessage || typeof userMessage !== 'string' || userMessage.trim() === "") {
          return new Response(JSON.stringify({ error: "Message is required" }), {
            status: 400,
            headers: { "Content-Type": "application/json" }
          });
        }

        const apiKey = env.GEMINI_API_KEY;
        if (!apiKey) {
          return new Response(JSON.stringify({ error: "API Key not configured on server" }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
          });
        }

        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

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

    try {
      return await env.ASSETS.fetch(request);
    } catch (e) {
      return new Response("Not Found", { status: 404 });
    }
  }
};
