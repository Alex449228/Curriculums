import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { NoAuthGuard } from './guards/no-auth.guard';
import { RoleGuard } from './guards/role.guard';
import { CandidateDetailsComponent } from './shared/components/candidate-details/candidate-details.component'; // Importa el componente


const routes: Routes = [
  {
    path: '',
    redirectTo: 'auth',
    pathMatch: 'full',
  },
  {
    path: 'auth',
    loadChildren: () =>
      import('./pages/auth/auth.module').then((m) => m.AuthPageModule),
    canActivate: [NoAuthGuard],
  },
  {
    path: 'main',
    loadChildren: () =>
      import('./pages/main/main.module').then((m) => m.MainPageModule),
    canActivate: [AuthGuard],
  },
  {
    path: 'main/sign-up-user',
    loadChildren: () =>
      import('./pages/main/sign-up-user/sign-up-user.module').then((m) => m.SignUpUserPageModule),
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'admin' }, // Parte donde el acceso es solo para usuarios con rol admin
  },
  {
    path: 'candidate-details/:id', 
    component: CandidateDetailsComponent,
    canActivate: [AuthGuard], 
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
