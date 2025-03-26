import { Component, ViewChild, ElementRef } from '@angular/core';
import { IonTextarea } from '@ionic/angular';
import { DeepSeekService } from 'src/app/services/deepseek.service';
import { FirebaseService } from 'src/app/services/firebase.service';
import { Curriculum } from 'src/app/models/curriculum.model';

interface Mensaje {
  role: string;
  content: string;
  timestamp: Date;
}

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage {
  @ViewChild('chatContainer', { static: false }) chatContainer: ElementRef;
  @ViewChild('inputMensaje', { static: false }) inputMensaje: IonTextarea;

  mensaje: string = '';
  mensajes: Mensaje[] = [];
  isLoading = false;
  error = '';
  modalAbierto = false;
  postulantes: Curriculum[] = [];
  postulantesSeleccionados: Curriculum[] = [];

  constructor(
    private deepSeekService: DeepSeekService,
    private firebaseService: FirebaseService
  ) {}

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  scrollToBottom() {
    try {
      this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
    } catch (err) {
      console.error('Error al desplazar el chat:', err);
    }
  }

  async abrirModalPostulantes() {
    this.isLoading = true;
    this.error = '';

    try {
      this.postulantes = await this.firebaseService.getAllCurriculums();
      this.modalAbierto = true;
    } catch (err) {
      console.error('Error al obtener postulantes:', err);
      this.error = 'Error al obtener la información de los postulantes';
    } finally {
      this.isLoading = false;
    }
  }

  cerrarModal() {
    this.modalAbierto = false;
    this.postulantesSeleccionados = [];
  }

  toggleSeleccionPostulante(postulante: Curriculum) {
    const index = this.postulantesSeleccionados.findIndex(p => p.id === postulante.id);
    if (index > -1) {
      this.postulantesSeleccionados.splice(index, 1);
    } else {
      this.postulantesSeleccionados.push(postulante);
    }
  }

  async confirmarSeleccion() {
    if (this.postulantesSeleccionados.length === 0) {
      this.error = 'Por favor, selecciona al menos un postulante.';
      return;
    }

    this.mensaje = this.postulantesSeleccionados.map(postulante => 
      `**Información del Postulante**\n\n` +
      `Nombre: ${postulante.name || 'Nombre no disponible'}\n` +
      `Carrera: ${postulante.career || 'Carrera no disponible'}\n` +
      `Experiencia: ${postulante.experience || 'Experiencia no especificada'}\n` +
      `Email: ${postulante.email || 'Email no disponible'}\n` +
      `Teléfono: ${postulante.phone || 'Teléfono no disponible'}\n` +
      `Ubicación: ${postulante.location || 'Ubicación no disponible'}\n` +
      `Idiomas: ${postulante.languages || 'Idiomas no especificados'}\n` +
      `Habilidades: ${postulante.skills || 'Habilidades no especificadas'}\n` +
      `Disponibilidad: ${postulante.availability || 'Disponibilidad no especificada'}\n` +
      `Notas: ${postulante.notes || 'Sin notas adicionales'}`
    ).join('\n\n--------------------------------\n\n');

    this.cerrarModal();
    setTimeout(() => this.inputMensaje.setFocus(), 100);
  }

  async enviarMensaje() {
    const mensajeActual = this.mensaje.trim();
    if (!mensajeActual) {
      this.error = 'Por favor, escribe un mensaje.';
      return;
    }

    this.isLoading = true;
    this.error = '';
    
    // Guardamos el mensaje en una variable antes de limpiar
    const contenidoMensaje = this.mensaje;
    
    // Agregamos el mensaje del usuario al historial
    this.mensajes.push({ 
      role: 'user', 
      content: contenidoMensaje,
      timestamp: new Date() 
    });

    // Limpiamos el campo de entrada
    this.mensaje = '';

    try {
      const respuesta = await this.deepSeekService
        .consultarDeepSeek(contenidoMensaje)  // Usamos la variable guardada
        .toPromise();

      // Agregamos la respuesta al historial
      this.mensajes.push({
        role: 'assistant',
        content: respuesta.choices[0].message.content,
        timestamp: new Date()
      });

    } catch (err) {
      console.error('Error al enviar mensaje:', err);
      this.error = 'Error al comunicarse con la IA';
      
      this.mensajes.push({
        role: 'system',
        content: 'Lo siento, hubo un error al procesar tu solicitud.',
        timestamp: new Date()
      });
    } finally {
      this.isLoading = false;
    }
  }
}