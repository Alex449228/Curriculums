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
  firebaseSvc = inject(FirebaseService); 
  utilsSvc = inject(UtilsService); 

  curriculums: Curriculum[] = []; 
  filteredCurriculums: Curriculum[] = []; 
  filter = {
    name: '', 
    career: '', 
    experience: '',
  };
  showPanel = false;
  availableCareers: string[] = []; 
  availableExperiences: string[] = [
    'Sin experiencia',
    '6 meses',
    '1 año',
    '2 años',
    '3 años',
    '4 años',
    '5 años',
    'Más de 5 años',
  ]; 
  users: { [key: string]: string } = {}; 

  
  currentPage = 1; 
  itemsPerPage = 10; 

  constructor(private firebaseService: FirebaseService, private router: Router) {}

  ngOnInit() {
    this.getAllCurriculums(); 
    this.getAllUsers(); 
  }

  async getAllCurriculums() {
    try {
      const snapshot = await this.firebaseService.firestore.collection('curriculums').get().toPromise();
      this.curriculums = snapshot.docs.map((doc) => {
        const data = doc.data() as Curriculum;
        return { id: doc.id, ...data }; 
      });
      this.filteredCurriculums = this.curriculums;

      this.normalizeExperiences();

      this.availableCareers = Array.from(new Set(this.curriculums.map((curriculum) => curriculum.career)));
    } catch (error) {
      console.error('Hubo un error al obtener los currículums:', error);
    }
  }

  normalizeExperiences() {
    this.curriculums.forEach((curriculum) => {
      curriculum.experience = this.getStandardizedExperience(curriculum.experience);
    });
  }

  getStandardizedExperience(experience: string): string {
    if (!experience) return 'Sin experiencia'; 

    experience = experience.toLowerCase();

    if (experience.includes('año') || experience.includes('anos')) {
      const years = experience.match(/\d+/); 
      if (years && years[0]) {
        const yearCount = parseInt(years[0], 10); 
        if (yearCount <= 5) {
          return `${yearCount} año${yearCount > 1 ? 's' : ''}`; 
        } else {
          return 'Más de 5 años'; 
        }
      }
    }

    if (experience.includes('mes')) {
      const months = experience.match(/\d+/); 
      if (months && months[0]) {
        const monthCount = parseInt(months[0], 10); 
        if (monthCount === 6) {
          return '6 meses'; 
        }
      }
    }

    return 'Sin experiencia';
  }

  async getAllUsers() {
    try {
      const snapshot = await this.firebaseService.firestore.collection('users').get().toPromise();
      snapshot.docs.forEach((doc) => {
        const data = doc.data() as User;
        this.users[doc.id] = data.displayName; 
      });
    } catch (error) {
      console.error('Hubo un error al obtener los usuarios:', error);
    }
  }

  getUserName(userId: string): string {
    return this.users[userId] || 'Desconocido'; 
  }

  viewDetails(curriculumId: string) {
    this.router.navigate(['/candidate-details', curriculumId]); 
  }

  togglePanel() {
    this.showPanel = !this.showPanel; 
  }

  applyFilter() {
    this.filteredCurriculums = this.curriculums.filter((curriculum) => {
      const matchesName = !this.filter.name || curriculum.name.toLowerCase().includes(this.filter.name.toLowerCase());
      const matchesCareer = !this.filter.career || curriculum.career.toLowerCase().includes(this.filter.career.toLowerCase());
      const matchesExperience = !this.filter.experience || curriculum.experience === this.filter.experience;

      return matchesName && matchesCareer && matchesExperience; 
    });
    this.currentPage = 1; 
  }

  selectCareer(career: string) {
    this.filter.career = career;
    this.applyFilter(); 
  }

  clearFilter(filterType: string) {
    this.filter[filterType] = ''; 
    this.applyFilter(); 
  }

  clearAllFilters() {
    this.filter.name = '';
    this.filter.career = '';
    this.filter.experience = '';
    this.applyFilter(); 
  }

  getFilteredCareers(): string[] {
    if (!this.filter.career) {
      return this.availableCareers; 
    }
    return this.availableCareers.filter((career) =>
      career.toLowerCase().includes(this.filter.career.toLowerCase()) 
    );
  }

  getPaginatedCurriculums(): Curriculum[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredCurriculums.slice(startIndex, endIndex); 
  }

  nextPage() {
    if (this.currentPage * this.itemsPerPage < this.filteredCurriculums.length) {
      this.currentPage++; 
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--; 
    }
  }

  goToPage(page: number) {
    this.currentPage = page; 
  }

  getPages(): number[] {
    const totalPages = Math.ceil(this.filteredCurriculums.length / this.itemsPerPage);
    return Array.from({ length: totalPages }, (_, i) => i + 1); 
  }

  addUpdateCandidates() {
    this.utilsSvc.presentModal({
      component: AddUpdateCVsComponent,
      cssClass: 'add-update-modal',
    });
  }

  getStatusColor(status: CurriculumStatus): string {
    switch (status) {
      case 'Pendiente de Revisión':
        return 'warning'; 
      case 'En Evaluación':
        return 'tertiary'; 
      case 'Preseleccionado':
        return 'primary'; 
      case 'Candidato por Entrevistar':
        return 'success'; 
      case 'Entrevista Realizada':
        return 'secondary'; 
      case 'Aprobado':
        return 'success'; 
      case 'Rechazado':
        return 'danger'; 
      case 'En Espera':
        return 'medium'; 
      case 'Necesita Atención':
        return 'danger'; 
      default:
        return 'medium'; 
    }
  }
}