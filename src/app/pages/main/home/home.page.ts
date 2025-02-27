import { Component, OnInit } from '@angular/core';
import { FirebaseService } from 'src/app/services/firebase.service';
import { Curriculum } from 'src/app/models/curriculum.model';
import { CurriculumStatus } from 'src/app/models/curriculum-status.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  curriculums: Curriculum[] = []; 
  filteredCandidates: Curriculum[] = []; 
  searchQuery: string = ''; 
  selectedStatus: string = 'all'; 
  recommendations: any[] = []; 

  constructor(private firebaseService: FirebaseService, private router: Router) {}

  async ngOnInit() {
   
    this.curriculums = await this.firebaseService.getAllCurriculums();
    this.filteredCandidates = this.curriculums; 

    
    this.generateRecommendations();
  }

  
  applyFilters() {
    this.filteredCandidates = this.curriculums.filter((candidate) => {
      const matchesSearch = candidate.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                            candidate.career.toLowerCase().includes(this.searchQuery.toLowerCase());
      const matchesStatus = this.selectedStatus === 'all' || candidate.status === this.selectedStatus;
      return matchesSearch && matchesStatus;
    });
  }

  /**
   * 
   * @param status 
   * @returns 
   */
  getCandidatesByStatus(status: CurriculumStatus): Curriculum[] {
    return this.curriculums.filter((curriculum) => curriculum.status === status);
  }

  /**
   * 
   * @param status 
   * @returns 
   */
  getStatusColor(status: CurriculumStatus): string {
    switch (status) {
      case 'Pendiente de Revisión':
        return 'warning';
      case 'Aprobado':
        return 'success';
      case 'Rechazado':
        return 'danger';
      case 'Candidato por Entrevistar':
        return 'primary';
      default:
        return 'medium';
    }
  }

  
  generateRecommendations() {
    const recommendations = [];

    if (this.getCandidatesByStatus('Pendiente de Revisión').length > 0) {
      recommendations.push({
        icon: 'alert-circle',
        color: 'warning',
        title: 'Revisar Candidatos Pendientes',
        description: 'Hay candidatos pendientes de revisión. Por favor, revíselos lo antes posible.',
      });
    }

    if (this.getCandidatesByStatus('Candidato por Entrevistar').length > 0) {
      recommendations.push({
        icon: 'calendar',
        color: 'primary',
        title: 'Programar Entrevistas',
        description: 'Hay candidatos que necesitan ser entrevistados. Programe las entrevistas lo antes posible.',
      });
    }

    if (this.getCandidatesByStatus('Necesita Atención').length > 0) {
      recommendations.push({
        icon: 'warning',
        color: 'danger',
        title: 'Candidatos que Necesitan Atención',
        description: 'Hay candidatos que necesitan atención inmediata. Por favor, revíselos.',
      });
    }

    this.recommendations = recommendations;
  }

  /**
   * 
   * @param candidate 
   */
  viewDetails(curriculumId: string) {
    this.router.navigate(['/candidate-details', curriculumId]); // Usamos el router para navegar
  }

  /**
   * 
   * @param candidate 
   */
  editCandidate(candidate: Curriculum) {
    console.log('Editar candidato:', candidate);
  }

getStatusIcon(status: CurriculumStatus): string {
  switch (status) {
    case 'Pendiente de Revisión':
      return 'time';
    case 'Aprobado':
      return 'checkmark-circle';
    case 'Rechazado':
      return 'close-circle';
    case 'Candidato por Entrevistar':
      return 'calendar';
    default:
      return 'help-circle';
  }
}
}