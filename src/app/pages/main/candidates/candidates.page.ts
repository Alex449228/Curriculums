import { Component, inject, OnInit } from '@angular/core';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { AddUpdateCVsComponent } from 'src/app/shared/components/add-update-cvs/add-update-cvs.component';
import { Curriculum } from 'src/app/models/curriculum.model';
import { CurriculumStatus } from 'src/app/models/curriculum-status.model';
import { User } from 'src/app/models/user.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-candidates',
  templateUrl: './candidates.page.html',
  styleUrls: ['./candidates.page.scss'],
})
export class CandidatesPage implements OnInit {
  firebaseSvc = inject(FirebaseService); // Servicio de Firebase
  utilsSvc = inject(UtilsService); // Servicio de utilidades

  curriculums: Curriculum[] = []; // Aquí guardamos todos los currículums
  filteredCurriculums: Curriculum[] = []; // Aquí guardamos los currículums filtrados
  filter = {
    name: '', // Filtro para buscar por nombre
    career: '', // Filtro para buscar por carrera
    experience: '', // Filtro para buscar por experiencia
  };
  showPanel = false; // Controla si el panel de filtros está abierto o cerrado
  availableCareers: string[] = []; // Lista de carreras disponibles para filtrar
  availableExperiences: string[] = [
    'Sin experiencia',
    '6 meses',
    '1 año',
    '2 años',
    '3 años',
    '4 años',
    '5 años',
    'Más de 5 años',
  ]; // Lista de experiencias predefinidas
  users: { [key: string]: string } = {}; // Aquí guardamos los nombres de los usuarios

  // Variables para manejar la paginación
  currentPage = 1; // Página actual
  itemsPerPage = 10; // Número de elementos por página

  constructor(private firebaseService: FirebaseService, private router: Router) {}

  ngOnInit() {
    this.getAllCurriculums(); // Cargamos todos los currículums al iniciar
    this.getAllUsers(); // Cargamos todos los usuarios al iniciar
  }

  // Obtiene todos los currículums desde Firebase
  async getAllCurriculums() {
    try {
      const snapshot = await this.firebaseService.firestore.collection('curriculums').get().toPromise();
      this.curriculums = snapshot.docs.map((doc) => {
        const data = doc.data() as Curriculum;
        return { id: doc.id, ...data }; // Mapeamos los datos de Firebase a nuestro modelo
      });
      this.filteredCurriculums = this.curriculums;

      // Normalizamos las experiencias para que estén en un formato estándar
      this.normalizeExperiences();

      // Extraemos las carreras disponibles para el filtro
      this.availableCareers = Array.from(new Set(this.curriculums.map((curriculum) => curriculum.career)));
    } catch (error) {
      console.error('Hubo un error al obtener los currículums:', error);
    }
  }

  // Normaliza las experiencias para que todas sigan el mismo formato
  normalizeExperiences() {
    this.curriculums.forEach((curriculum) => {
      curriculum.experience = this.getStandardizedExperience(curriculum.experience);
    });
  }

  // Convierte una experiencia en un formato estándar
  getStandardizedExperience(experience: string): string {
    if (!experience) return 'Sin experiencia'; // Si no hay experiencia, devolvemos "Sin experiencia"

    // Convertimos todo a minúsculas para evitar problemas con mayúsculas y minúsculas
    experience = experience.toLowerCase();

    // Si la experiencia incluye "año" o "años", extraemos el número de años
    if (experience.includes('año') || experience.includes('anos')) {
      const years = experience.match(/\d+/); // Buscamos el número en el texto
      if (years && years[0]) {
        const yearCount = parseInt(years[0], 10); // Convertimos el número a entero
        if (yearCount <= 5) {
          return `${yearCount} año${yearCount > 1 ? 's' : ''}`; // Formateamos el texto
        } else {
          return 'Más de 5 años'; // Si es más de 5 años, devolvemos este texto
        }
      }
    }

    // Si la experiencia incluye "mes", extraemos el número de meses
    if (experience.includes('mes')) {
      const months = experience.match(/\d+/); // Buscamos el número en el texto
      if (months && months[0]) {
        const monthCount = parseInt(months[0], 10); // Convertimos el número a entero
        if (monthCount === 6) {
          return '6 meses'; // Si son 6 meses, devolvemos este texto
        }
      }
    }

    // Si no coincide con ninguna opción predefinida, devolvemos "Sin experiencia"
    return 'Sin experiencia';
  }

  // Obtiene todos los usuarios desde Firebase
  async getAllUsers() {
    try {
      const snapshot = await this.firebaseService.firestore.collection('users').get().toPromise();
      snapshot.docs.forEach((doc) => {
        const data = doc.data() as User;
        this.users[doc.id] = data.displayName; // Guardamos el nombre del usuario por su ID
      });
    } catch (error) {
      console.error('Hubo un error al obtener los usuarios:', error);
    }
  }

  // Obtiene el nombre de un usuario por su ID
  getUserName(userId: string): string {
    return this.users[userId] || 'Desconocido'; // Si no encontramos el usuario, devolvemos "Desconocido"
  }

  // Navega a la página de detalles de un currículum
  viewDetails(curriculumId: string) {
    this.router.navigate(['/candidate-details', curriculumId]); // Usamos el router para navegar
  }

  // Abre o cierra el panel de filtros
  togglePanel() {
    this.showPanel = !this.showPanel; // Cambiamos el estado del panel
  }

  // Aplica los filtros a la lista de currículums
  applyFilter() {
    this.filteredCurriculums = this.curriculums.filter((curriculum) => {
      const matchesName = !this.filter.name || curriculum.name.toLowerCase().includes(this.filter.name.toLowerCase());
      const matchesCareer = !this.filter.career || curriculum.career.toLowerCase().includes(this.filter.career.toLowerCase());
      const matchesExperience = !this.filter.experience || curriculum.experience === this.filter.experience;

      return matchesName && matchesCareer && matchesExperience; // Aplicamos los filtros
    });
    this.currentPage = 1; // Reiniciamos la paginación después de aplicar los filtros
  }

  // Selecciona una carrera y aplica el filtro
  selectCareer(career: string) {
    this.filter.career = career;
    this.applyFilter(); // Aplicamos el filtro automáticamente
  }

  // Limpia un filtro específico
  clearFilter(filterType: string) {
    this.filter[filterType] = ''; // Limpiamos el filtro
    this.applyFilter(); // Aplicamos los filtros nuevamente
  }

  // Limpia todos los filtros aplicados
  clearAllFilters() {
    this.filter.name = '';
    this.filter.career = '';
    this.filter.experience = '';
    this.applyFilter(); // Aplicamos los filtros nuevamente
  }

  // Filtra las carreras disponibles según el texto ingresado
  getFilteredCareers(): string[] {
    if (!this.filter.career) {
      return this.availableCareers; // Si no hay texto, devolvemos todas las carreras
    }
    return this.availableCareers.filter((career) =>
      career.toLowerCase().includes(this.filter.career.toLowerCase()) // Filtramos las carreras
    );
  }

  // Obtiene los currículums paginados
  getPaginatedCurriculums(): Curriculum[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredCurriculums.slice(startIndex, endIndex); // Devolvemos solo los currículums de la página actual
  }

  // Navega a la página siguiente
  nextPage() {
    if (this.currentPage * this.itemsPerPage < this.filteredCurriculums.length) {
      this.currentPage++; // Incrementamos la página actual
    }
  }

  // Navega a la página anterior
  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--; // Decrementamos la página actual
    }
  }

  // Navega a una página específica
  goToPage(page: number) {
    this.currentPage = page; // Cambiamos a la página seleccionada
  }

  // Obtiene la lista de páginas disponibles
  getPages(): number[] {
    const totalPages = Math.ceil(this.filteredCurriculums.length / this.itemsPerPage);
    return Array.from({ length: totalPages }, (_, i) => i + 1); // Generamos un array con los números de página
  }

  // Abre el modal para agregar o actualizar candidatos
  addUpdateCandidates() {
    this.utilsSvc.presentModal({
      component: AddUpdateCVsComponent,
      cssClass: 'add-update-modal',
    });
  }

  // Retorna el color correspondiente al estado del candidato
  getStatusColor(status: CurriculumStatus): string {
    switch (status) {
      case 'Pendiente de Revisión':
        return 'warning'; // Amarillo
      case 'En Evaluación':
        return 'tertiary'; // Morado claro
      case 'Preseleccionado':
        return 'primary'; // Azul
      case 'Candidato por Entrevistar':
        return 'success'; // Verde
      case 'Entrevista Realizada':
        return 'secondary'; // Gris claro
      case 'Aprobado':
        return 'success'; // Verde
      case 'Rechazado':
        return 'danger'; // Rojo
      case 'En Espera':
        return 'medium'; // Gris medio
      case 'Necesita Atención':
        return 'danger'; // Rojo
      default:
        return 'medium'; // Gris por defecto
    }
  }
}