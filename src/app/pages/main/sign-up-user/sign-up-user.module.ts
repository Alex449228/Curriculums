import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SignUpUserPageRoutingModule } from './sign-up-user-routing.module';

import { SignUpUserPage } from './sign-up-user.page';
import { SharedModule } from 'src/app/shared/shared.module';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    component: SignUpUserPage,
  },
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SignUpUserPageRoutingModule,
    SharedModule,
    RouterModule.forChild(routes),
  ],
  declarations: [SignUpUserPage],
})
export class SignUpUserPageModule {}
