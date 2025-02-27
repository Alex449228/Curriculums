import { Injectable, inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  CanActivate,
} from '@angular/router';
import { Observable } from 'rxjs';
import { FirebaseService } from '../services/firebase.service';
import { UtilsService } from '../services/utils.service';
import { Auth, onAuthStateChanged } from 'firebase/auth';

@Injectable({
  providedIn: 'root',
})
export class NoAuthGuard implements CanActivate {
  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService);

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    
    return new Promise((resolve) => {
      const auth: Auth = this.firebaseSvc.getAuth();
      
      onAuthStateChanged(auth, (user) => {
        if (!user) {
          // Si no hay usuario autenticado, permite el acceso a la ruta
          localStorage.removeItem('user');
          resolve(true);
        } else {
          // Si hay usuario autenticado, redirige a home y bloquea el acceso
          if (!localStorage.getItem('user')) {
            localStorage.setItem('user', JSON.stringify(user));
          }
          this.utilsSvc.routerLink('/main/home');
          resolve(false);
        }
      });
    });
  }
}