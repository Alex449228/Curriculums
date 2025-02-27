import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SignUpUserPage } from './sign-up-user.page';

const routes: Routes = [
  {
    path: '',
    component: SignUpUserPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SignUpUserPageRoutingModule {}
