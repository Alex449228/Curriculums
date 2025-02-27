import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-sign-up-user',
  templateUrl: './sign-up-user.page.html',
  styleUrls: ['./sign-up-user.page.scss'],
})
export class SignUpUserPage implements OnInit {

  form = new FormGroup({
    uid: new FormControl(''),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
    name: new FormControl('', [Validators.required, Validators.minLength(4)]),
    role: new FormControl('', [Validators.required]), 
  });

  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService);

  ngOnInit() {}

  async submit() {
    if (this.form.valid) {
      const loading = await this.utilsSvc.loading();
      await loading.present();

      const userData = {
        uid: this.form.value.uid, 
        email: this.form.value.email,
        password: this.form.value.password,
        displayName: this.form.value.name,
        role: this.form.value.role,
      };

      this.firebaseSvc
        .createUserWithoutSignIn(userData)
        .then((uid) => {
          this.utilsSvc.presentToast({
            message: `Usuario registrado exitosamente con nombre: ${this.form.value.name}`,
            duration: 2500,
            color: 'success',
            position: 'middle',
            icon: 'checkmark-circle-outline',
          });
          this.form.reset();
        })
        .catch((error) => {
          console.log(error);

          this.utilsSvc.presentToast({
            message: error.message,
            duration: 2500,
            color: 'primary',
            position: 'middle',
            icon: 'alert-circle-outline',
          });
        })
        .finally(() => {
          loading.dismiss();
        });
    }
  }
}