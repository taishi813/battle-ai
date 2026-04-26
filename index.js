import express from "express";
import cors from "cors";
import fs from "fs";
import dotenv from "dotenv";
import Anthropic from "@anthropic-ai/sdk";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const client = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

// ログ読み込み
const log = fs.readFileSync("./log.txt", "utf-8");

app.post("/generate", async (req, res) => {
  const extra = req.body.prompt || "";

  try {
    const response = await client.messages.create({
      model: "claude-3-5-sonnet",
      max_tokens: 2000,
      messages: [
        {
          role: "user",
          content: `
以下は過去のバトルログです：

${log}

この続きとして、新しいバトルログを書いてください。

条件：
・文体を再現
・会話中心
・心理戦あり
・一進一退→決着

${extra}
`
        }
      ]
    });

    res.json({
      reply: response.content[0].text
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => {
  console.log("http://localhost:3000 で起動中");
});
