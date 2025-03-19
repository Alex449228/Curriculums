import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DeepSeekService {
  private openRouterApiUrl = 'https://openrouter.ai/api/v1/chat/completions'; 
  private apiKey = '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'; 

  constructor(private http: HttpClient) {}

  /**
   * 
   * @param prompt 
   * @returns 
   */
  consultarDeepSeek(prompt: string): Observable<any> {
    const body = {
      model: 'deepseek/deepseek-r1-distill-qwen-14b:free', 
      messages: [{ role: 'user', content: prompt }],
    };

    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    });

    return this.http.post(this.openRouterApiUrl, body, { headers });
  }
}