import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-chat', 
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements OnInit { // Renombrada la clase
  apiStatus: { status?: string, ruta_chat?: string } = {};
  isLoading = true;
  error = '';

  apiUrl = 'https://pruebaapi-93nx.onrender.com'; 

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.fetchApiStatus();
  }

  private async fetchApiStatus() {
    try {
      const response = await this.http.get<{ status: string, ruta_chat: string }>(this.apiUrl).toPromise();
      this.apiStatus = response || {};
    } catch (err) {
      console.error('Error fetching API status:', err);
      this.error = 'Error al obtener el estado de la API';
    } finally {
      this.isLoading = false;
    }
  }
}
