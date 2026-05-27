import axios from "axios";
import Chat from "../models/Chat.js";
import User from "../models/User.js";
import imagekit from "../configs/imageKit.js";
import openai from "../configs/openai.js";

//test-based AI chat controller
/* export const textMessageController = async (req, res) => {
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

    const { choices } = await openai.chat.completions.create({
      model: "gemini-2.0-flash",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

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
*/

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
        break; // success, exit loop
      } catch (err) {
        attempts++;
        if (attempts === maxAttempts) throw err; // give up after 3 tries
        await new Promise(resolve => setTimeout(resolve, 2000 * attempts)); // wait 2s, 4s
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

//image-based AI chat controller
export const imageMessageController = async (req, res) => {
  try {
    const userId = req.user._id;

    const { prompt, chatId, isPublished } = req.body;

    //find chat and add user message
    const chat = await Chat.findOne({ userId, _id: chatId });
    chat.messages.push({
      role: "user",
      content: prompt,
      timeStamp: Date.now(),
      isImage: false,
    });

    // 1. Generate the image using Gemini Flash Image Preview
    const apiKey = process.env.GEMINI_API_KEY;
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-preview-image-generation:generateContent?key=${apiKey}`;

    const payload = {
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        responseModalities: ['TEXT', 'IMAGE'] // Request an image response
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
    
    // 2. Get the base64 data from the new response structure
    const base64ImageData = result?.candidates?.[0]?.content?.parts?.find(p => p.inlineData)?.inlineData?.data;

    if (!base64ImageData) {
      throw new Error("Invalid or empty response from Gemini API");
    }
    
    const base64Image = `data:image/png;base64,${base64ImageData}`;

    // 3. Upload image to imagekit media library
    const uploadResponse = await imagekit.upload({
      file: base64Image,
      fileName: `${Date.now()}.png`,
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
    console.error("Error in imageMessageController:", error); // Log the full error
    res.json({ success: false, message: error.message });
  }
};