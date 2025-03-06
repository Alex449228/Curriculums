import { Component } from '@angular/core';
import { DeepSeekService } from 'src/app/services/deepseek.service'; // Importa el servicio de DeepSeek

@Component({
  selector: 'app-chat', // Selector del componente
  templateUrl: './chat.page.html', // Ruta de la plantilla HTML
  styleUrls: ['./chat.page.scss'], // Ruta de los estilos SCSS
})
export class ChatPage {
  mensaje: string = ''; // Almacena el mensaje del usuario
  mensajes: { role: string; content: string }[] = []; // Almacena el historial del chat
  isLoading = false; // Controla el estado de carga
  error = ''; // Almacena mensajes de error

  constructor(private deepSeekService: DeepSeekService) {}

  // Método para enviar un mensaje a la IA
  async enviarMensaje() {
    if (!this.mensaje.trim()) return; // Evita enviar mensajes vacíos

    this.isLoading = true;
    this.error = '';

    // Agrega el mensaje del usuario al historial
    this.mensajes.push({ role: 'user', content: this.mensaje });

    try {
      // Envía el mensaje a la API de DeepSeek
      const respuesta = await this.deepSeekService
        .consultarDeepSeek(this.mensaje)
        .toPromise();

      // Agrega la respuesta de la IA al historial
      this.mensajes.push({
        role: 'assistant',
        content: respuesta.choices[0].message.content,
      });

      // Limpia el input
      this.mensaje = '';
    } catch (err) {
      console.error('Error al enviar mensaje:', err);
      this.error = 'Error al comunicarse con la IA';
    } finally {
      this.isLoading = false;
    }
  }
}