import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import {
  LoadingController,
  ModalController,
  ModalOptions,
  ToastController,
  ToastOptions,
} from '@ionic/angular';

@Injectable({
  providedIn: 'root',
})
export class UtilsService {
  loadingCtrl = inject(LoadingController);
  toastCtrl = inject(ToastController);
  modalCrtl = inject(ModalController);
  router = inject(Router);

  // ---------- Loading --------------
  loading() {
    return this.loadingCtrl.create({ spinner: 'crescent' });
  }

  // ---------- Toast ---------------
  async presentToast(opts?: ToastOptions) {
    const toast = await this.toastCtrl.create(opts);
    toast.present();
  }

  // ---------- Enrutar a paginas disponibles ---------------
  routerLink(url: string) {
    return this.router.navigateByUrl(url);
  }

  // --------- Guardar en localstorage -------------
  saveInLocalStorage(key: string, value: any) {
    return localStorage.setItem(key, JSON.stringify(value));
  }

  // -------- Obtener desde LocalStorage ----------
  getFromLocalStorage(key: string) {
    return JSON.parse(localStorage.getItem(key));
  }

  // -------- Modal -------------
  async presentModal(opts: ModalOptions) {
    const modal = await this.modalCrtl.create(opts);
  
    await modal.present();

    const { data } = await modal.onWillDismiss();

    if(data) return data;
  }

  dismissModal(data?: any) {
    return this.modalCrtl.dismiss(data);
  }
}
