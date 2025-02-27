import { Injectable, inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  CanActivate,
  Router
} from '@angular/router';
import { Observable } from 'rxjs';
import { FirebaseService } from '../services/firebase.service';
import { UtilsService } from '../services/utils.service';

@Injectable({
  providedIn: 'root',
})
export class RoleGuard implements CanActivate {
  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService);
  router = inject(Router);

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    return new Promise(async (resolve) => {
      const user = this.firebaseSvc.getAuth().currentUser;
      if (user) {
        // Obtiene el rol del usuario actual
        const userRole = await this.firebaseSvc.getUserRole(user.uid);
        const expectedRole = route.data['role'];  // Obtener el rol esperado desde los datos de la ruta

        // Verifica si el rol del usuario coincide con el rol esperado
        if (userRole === expectedRole) {
          resolve(true);
        } else {
          // Si el rol no coincide, redirige al home
          this.router.navigate(['/main/home']);
          resolve(false);
        }
      } else {
        // Si no hay usuario, redirige a la página de autenticación
        this.router.navigate(['/auth']);
        resolve(false);
      }
    });
  }
}
