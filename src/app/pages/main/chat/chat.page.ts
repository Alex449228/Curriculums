import { Component } from '@angular/core';
import { DeepSeekService } from 'src/app/services/deepseek.service';
import { FirebaseService } from 'src/app/services/firebase.service';
import { Curriculum } from 'src/app/models/curriculum.model';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage {
  mensaje: string = '';
  mensajes: { role: string; content: string }[] = [];
  isLoading = false;
  error = '';
  modalAbierto = false;
  postulantes: Curriculum[] = [];
  postulantesSeleccionados: Curriculum[] = [];

  constructor(
    private deepSeekService: DeepSeekService,
    private firebaseService: FirebaseService
  ) {}

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
  }

  toggleSeleccionPostulante(postulante: Curriculum) {
    const index = this.postulantesSeleccionados.findIndex(p => p.id === postulante.id);
    
    if (index > -1) {
      this.postulantesSeleccionados.splice(index, 1);
    } else {
      this.postulantesSeleccionados.push(postulante);
    }
  }

  confirmarSeleccion() {
    if (this.postulantesSeleccionados.length === 0) {
      console.warn('No hay postulantes seleccionados');
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
  }

  async enviarMensaje() {
    if (!this.mensaje.trim()) return;

    this.isLoading = true;
    this.error = '';

    this.mensajes.push({ role: 'user', content: this.mensaje });

    try {
      const respuesta = await this.deepSeekService
        .consultarDeepSeek(this.mensaje)
        .toPromise();

      this.mensajes.push({
        role: 'assistant',
        content: respuesta.choices[0].message.content,
      });

      this.mensaje = '';
    } catch (err) {
      console.error('Error al enviar mensaje:', err);
      this.error = 'Error al comunicarse con la IA';
    } finally {
      this.isLoading = false;
    }
  }
}