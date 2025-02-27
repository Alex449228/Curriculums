import { Component, OnInit } from '@angular/core';
import { FirebaseService } from 'src/app/services/firebase.service'; 
import { User } from 'src/app/models/user.model';
import { Curriculum } from 'src/app/models/curriculum.model';
import { UtilsService } from 'src/app/services/utils.service';
import { ModalController, AlertController } from '@ionic/angular';
import { AddUpdateCVsComponent } from 'src/app/shared/components/add-update-cvs/add-update-cvs.component'; 

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {

  user: User | undefined;
  avatarColor: string = '';
  curriculums: Curriculum[] = [];

  constructor(
    private firebaseService: FirebaseService,
    private utilsService: UtilsService,
    private modalController: ModalController,
    private alertController: AlertController
  ) {}

  ngOnInit(): void {
    const uid = this.firebaseService.getAuth().currentUser?.uid;
    if (uid) {
      this.firebaseService.getUserProfile(uid).then(user => {
        this.user = user;
        if (user) {
          this.avatarColor = this.getColorFromInitials(this.getInitials(user.displayName));
          this.loadCurriculums(user.uid);
        }
      });
    }
  }

  getInitials(name: string): string {
    const initials = name.split(' ').map(n => n[0]).join('');
    return initials.toUpperCase();
  }

  getColorFromInitials(initials: string): string {
    const colors = ['#FF5733', '#33FF57', '#3357FF', '#FF33A1', '#FF8C33'];
    const charCodeSum = initials.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return colors[charCodeSum % colors.length];
  }

  loadCurriculums(uid: string) {
    this.firebaseService.getCurriculumsByUser(uid).then(curriculums => {
      this.curriculums = curriculums.map(curriculum => ({
        ...curriculum,
        showDetails: false 
      }));
    });
  }

  toggleDetails(curriculum: Curriculum) {
    curriculum.showDetails = !curriculum.showDetails;
  }

  async updateCurriculum(curriculum: Curriculum) {
    const modal = await this.modalController.create({
      component: AddUpdateCVsComponent,
      componentProps: { curriculum }, 
      cssClass: 'add-update-modal',
    });

    modal.onWillDismiss().then(() => {
      this.loadCurriculums(this.user?.uid || ''); 
    });

    return await modal.present();
  }

  deleteCurriculum(curriculumId: string) {
    this.firebaseService.deleteCurriculum(curriculumId).then(() => {
      this.curriculums = this.curriculums.filter(c => c.id !== curriculumId);
    });
  }

  async showDeleteConfirmation(curriculum: Curriculum) {
    const alert = await this.alertController.create({
      header: 'Confirmar eliminación',
      message: '¿Estás seguro de que deseas eliminar este currículum? Esta acción no se puede deshacer.',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Operación cancelada');
          }
        },
        {
          text: 'Eliminar',
          cssClass: 'danger',
          handler: () => {
            this.confirmDelete(curriculum.id);
          }
        }
      ]
    });

    await alert.present();
  }

  private async confirmDelete(curriculumId: string) {
    const loading = await this.utilsService.loading();
    try {
      await loading.present();
      
      await this.firebaseService.deleteCurriculum(curriculumId);
      this.curriculums = this.curriculums.filter(c => c.id !== curriculumId);
      
      await this.utilsService.presentToast({
        message: 'Currículum eliminado correctamente',
        duration: 2500,
        color: 'success',
        position: 'middle',
        icon: 'checkmark-circle-outline'
      });
    } catch (error) {
      console.error('Error al eliminar el currículum:', error);
      await this.utilsService.presentToast({
        message: 'Error al eliminar el currículum',
        duration: 2500,
        color: 'danger',
        position: 'middle',
        icon: 'alert-circle-outline'
      });
    } finally {
      await loading.dismiss();
    }
  }
}