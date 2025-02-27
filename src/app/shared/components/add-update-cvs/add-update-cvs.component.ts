import { Component, inject, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Curriculum } from 'src/app/models/curriculum.model';
import { CurriculumStatus } from 'src/app/models/curriculum-status.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { AuthService } from 'src/app/services/auth.service';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-add-update-cvs',
  templateUrl: './add-update-cvs.component.html',
  styleUrls: ['./add-update-cvs.component.scss'],
})
export class AddUpdateCVsComponent implements OnInit {
  @Input() curriculum: Curriculum;

  form = new FormGroup({
    id: new FormControl(''),
    name: new FormControl('', [Validators.required, Validators.minLength(4)]),
    career: new FormControl('', [Validators.required, Validators.minLength(4)]),
    experience: new FormControl('', [Validators.required, Validators.minLength(4)]),
    date: new FormControl('', [Validators.required, Validators.pattern(/^\d{4}-\d{2}-\d{2}$/)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    phone: new FormControl('', [Validators.required, Validators.pattern(/^\d{10}$/)]),
    location: new FormControl('', [Validators.required]),
    languages: new FormControl('', [Validators.required]),
    skills: new FormControl('', [Validators.required]),
    availability: new FormControl('', [Validators.required]),
    notes: new FormControl(''),
    pdf: new FormControl(null),
    status: new FormControl('Pendiente de Revisión' as CurriculumStatus, [Validators.required]), 
  });

  fileName: string | null = null;
  isUpdating: boolean = false;
  existingPdfUrl: string | null = null;

  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService);
  authSvc = inject(AuthService);
  modalCtrl = inject(ModalController);

  ngOnInit() {
    if (this.curriculum) {
      this.isUpdating = true;
      this.existingPdfUrl = this.curriculum.pdfUrl;
      
      this.form.get('pdf').clearValidators();
      this.form.get('pdf').updateValueAndValidity();

      this.form.patchValue({
        id: this.curriculum.id,
        name: this.curriculum.name,
        career: this.curriculum.career,
        experience: this.curriculum.experience,
        date: this.curriculum.date,
        email: this.curriculum.email,
        phone: this.curriculum.phone,
        location: this.curriculum.location,
        languages: this.curriculum.languages,
        skills: this.curriculum.skills,
        availability: this.curriculum.availability,
        notes: this.curriculum.notes,
        status: this.curriculum.status as CurriculumStatus, 
      });

      if (this.curriculum.pdfUrl) {
        this.fileName = this.getFileNameFromUrl(this.curriculum.pdfUrl);
      }
    } else {
      this.form.get('pdf').setValidators([Validators.required]);
      this.form.get('pdf').updateValueAndValidity();
    }
  }

  async submit() {
    if (this.form.valid) {
      const loading = await this.utilsSvc.loading();
      await loading.present();

      try {
        const user = await this.authSvc.getCurrentUser();
        if (!user) {
          throw new Error('Debes iniciar sesión para publicar tu currículum.');
        }

        const formValues = this.form.value;
        const curriculumId = this.isUpdating ? this.curriculum.id : this.firebaseSvc.createId();

        const curriculum: Curriculum = {
          id: curriculumId,
          name: formValues.name,
          career: formValues.career,
          experience: formValues.experience,
          date: formValues.date,
          email: formValues.email,
          phone: formValues.phone,
          location: formValues.location,
          languages: formValues.languages,
          skills: formValues.skills,
          availability: formValues.availability,
          notes: formValues.notes,
          pdfUrl: this.existingPdfUrl || '', 
          userId: user.uid,
          status: formValues.status as CurriculumStatus, 
        };

        const file = formValues.pdf;
        if (file) {
          const filePath = `curriculums/${curriculum.userId}/${curriculum.id}/${file.name}`;
          const fileRef = this.firebaseSvc.storage.ref(filePath);
          await fileRef.put(file);
          curriculum.pdfUrl = await fileRef.getDownloadURL().toPromise();
        }

        if (this.isUpdating) {
          await this.firebaseSvc.updateCurriculum(curriculum);
          this.utilsSvc.presentToast({
            message: 'Currículum actualizado con éxito',
            duration: 2500,
            color: 'success',
            position: 'middle',
            icon: 'checkmark-circle-outline',
          });
        } else {
          await this.firebaseSvc.createCurriculum(curriculum, file);
          this.utilsSvc.presentToast({
            message: 'Currículum publicado con éxito',
            duration: 2500,
            color: 'success',
            position: 'middle',
            icon: 'checkmark-circle-outline',
          });
        }

        this.dismiss();
      } catch (error) {
        console.error(error);
        this.utilsSvc.presentToast({
          message: error.message,
          duration: 2500,
          color: 'danger',
          position: 'middle',
          icon: 'alert-circle-outline',
        });
      } finally {
        loading.dismiss();
      }
    }
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.form.patchValue({ pdf: file });
      this.fileName = file.name;
      this.existingPdfUrl = null;
    }
  }

  removeFile() {
    this.form.patchValue({ pdf: null });
    this.fileName = null;
    if (this.isUpdating) {
      this.existingPdfUrl = null;
      this.form.get('pdf').setValidators([Validators.required]);
      this.form.get('pdf').updateValueAndValidity();
    }
  }

  getFileNameFromUrl(url: string): string {
    return url.substring(url.lastIndexOf('/') + 1);
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }
}