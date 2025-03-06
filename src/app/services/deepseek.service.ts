import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DeepSeekService {
  private openRouterApiUrl = 'https://openrouter.ai/api/v1/chat/completions'; // Endpoint de OpenRouter
  private apiKey = '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'; // Reemplaza con tu API Key de OpenRouter

  constructor(private http: HttpClient) {}

  /**
   * Envía una solicitud a la API de DeepSeek y obtiene una respuesta.
   * @param prompt El mensaje o consulta que se enviará a la IA.
   * @returns Un Observable con la respuesta de la IA.
   */
  consultarDeepSeek(prompt: string): Observable<any> {
    const body = {
      model: 'deepseek/deepseek-r1-distill-llama-70b', // Modelo de IA
      messages: [{ role: 'user', content: prompt }],
    };

    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    });

    return this.http.post(this.openRouterApiUrl, body, { headers });
  }
}