import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FirebaseService } from 'src/app/services/firebase.service';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-candidate-details',
  templateUrl: './candidate-details.component.html',
  styleUrls: ['./candidate-details.component.scss'],
})
export class CandidateDetailsComponent implements OnInit {
  curriculumId: string;
  curriculum: any;

  constructor(
    private route: ActivatedRoute,
    private firebaseService: FirebaseService,
    private navCtrl: NavController 
  ) {}

  ngOnInit() {
    this.curriculumId = this.route.snapshot.paramMap.get('id');
    if (this.curriculumId) {
      this.getCurriculumDetails();
    }
  }

  async getCurriculumDetails() {
    try {
      const doc = await this.firebaseService.firestore
        .collection('curriculums')
        .doc(this.curriculumId)
        .get()
        .toPromise();

      if (doc.exists) {
        this.curriculum = doc.data();
      } else {
        console.error('No se encontró el currículum con el ID proporcionado');
      }
    } catch (error) {
      console.error('Error al obtener los detalles del currículum:', error);
    }
  }

  goBack() {
    this.navCtrl.back();
  }
}
