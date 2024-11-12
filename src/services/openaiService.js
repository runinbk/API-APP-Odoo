import OpenAI from 'openai';
import config from '../config/config.js';

class OpenAIService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: config.openaiApiKey
    });
  }

  async transcribeAudio(audioBuffer) {
    try {
      const transcript = await this.openai.audio.transcriptions.create({
        file: audioBuffer,
        model: "whisper-1",
      });
      return transcript.text;
    } catch (error) {
      throw new Error(`Transcription error: ${error.message}`);
    }
  }

  async generateTask(transcript) {
    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { 
            role: "system", 
            content: "Generate a study task based on this class transcript" 
          },
          { 
            role: "user", 
            content: transcript 
          }
        ]
      });
      return completion.choices[0].message.content;
    } catch (error) {
      throw new Error(`Task generation error: ${error.message}`);
    }
  }
}

export default new OpenAIService();
