import axios from "axios";
import Chat from "../models/Chat.js";
import User from "../models/User.js";
import imagekit from "../configs/imageKit.js";
import openai from "../configs/openai.js";

//text-based AI chat controller
export const textMessageController = async (req, res) => {
  try {
    const userId = req.user._id;
    const { chatId, prompt } = req.body;

    const chat = await Chat.findOne({ userId, _id: chatId });
    chat.messages.push({
      role: "user",
      content: prompt,
      timeStamp: Date.now(),
      isImage: false,
    });

    // Retry logic for rate limiting
    let choices;
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      try {
        const response = await openai.chat.completions.create({
          model: "gemini-2.0-flash",
          messages: [{ role: "user", content: prompt }],
        });
        choices = response.choices;
        break;
      } catch (err) {
        attempts++;
        if (attempts === maxAttempts) throw err;
        await new Promise(resolve => setTimeout(resolve, 2000 * attempts));
      }
    }

    const reply = {
      ...choices[0].message,
      timeStamp: Date.now(),
      isImage: false,
    };

    res.json({ success: true, reply });
    chat.messages.push(reply);
    await chat.save();

  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

/* OLD GEMINI IMAGE CONTROLLER - uncomment when billing is enabled
export const imageMessageController = async (req, res) => {
  try {
    const userId = req.user._id;
    const { prompt, chatId, isPublished } = req.body;

    const chat = await Chat.findOne({ userId, _id: chatId });
    chat.messages.push({
      role: "user",
      content: prompt,
      timeStamp: Date.now(),
      isImage: false,
    });

    const apiKey = process.env.GEMINI_API_KEY;
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image-preview:generateContent?key=${apiKey}`;

    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseModalities: ['TEXT', 'IMAGE']
      },
    };

    const fetchResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!fetchResponse.ok) {
      const errorBody = await fetchResponse.text();
      throw new Error(`Gemini API request failed with status ${fetchResponse.status}: ${errorBody}`);
    }

    const result = await fetchResponse.json();
    const base64ImageData = result?.candidates?.[0]?.content?.parts?.find(p => p.inlineData)?.inlineData?.data;

    if (!base64ImageData) {
      throw new Error("Invalid or empty response from Gemini API");
    }

    const base64Image = `data:image/png;base64,${base64ImageData}`;

    const uploadResponse = await imagekit.upload({
      file: base64Image,
      fileName: `${Date.now()}.png`,
      folder: "chatsketch",
    });

    const reply = {
      role: "assistant",
      content: uploadResponse.url,
      timeStamp: Date.now(),
      isImage: true,
      isPublished,
    };
    res.json({ success: true, reply });

    chat.messages.push(reply);
    await chat.save();
  } catch (error) {
    console.error("Error in imageMessageController:", error);
    res.json({ success: false, message: error.message });
  }
};
*/

//image-based AI chat controller (Pollinations - free, no API key needed)
export const imageMessageController = async (req, res) => {
  try {
    const userId = req.user._id;
    const { prompt, chatId, isPublished } = req.body;

    const chat = await Chat.findOne({ userId, _id: chatId });
    chat.messages.push({
      role: "user",
      content: prompt,
      timeStamp: Date.now(),
      isImage: false,
    });

    // 1. Generate image using Pollinations
    const encodedPrompt = encodeURIComponent(prompt);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=768&height=768&nologo=true`;

    // 2. Fetch the image and convert to base64
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error(`Pollinations API failed with status ${imageResponse.status}`);
    }
    const arrayBuffer = await imageResponse.arrayBuffer();
    const base64Image = `data:image/jpeg;base64,${Buffer.from(arrayBuffer).toString('base64')}`;

    // 3. Upload image to imagekit
    const uploadResponse = await imagekit.upload({
      file: base64Image,
      fileName: `${Date.now()}.jpg`,
      folder: "chatsketch",
    });

    // 4. Send reply to frontend
    const reply = {
      role: "assistant",
      content: uploadResponse.url,
      timeStamp: Date.now(),
      isImage: true,
      isPublished,
    };
    res.json({ success: true, reply });

    chat.messages.push(reply);
    await chat.save();

  } catch (error) {
    console.error("Error in imageMessageController:", error);
    res.json({ success: false, message: error.message });
  }
};