import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private model: any;

  constructor() {

  }

  async getAIResponse(messages: any[]): Promise<string> {
    const prompt = messages.map(msg => `${msg.role}: ${msg.content}`).join('\n');
    const result = await this.model.generateContent(prompt);
    return result.response.text();
  }
}