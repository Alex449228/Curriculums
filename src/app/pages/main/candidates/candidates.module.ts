import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CandidatesPageRoutingModule } from './candidates-routing.module';

import { CandidatesPage } from './candidates.page';
import { SharedModule } from '../../../shared/shared.module';
import { FilterPipe } from 'src/app/filter.pipe';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CandidatesPageRoutingModule,
    SharedModule,
  ],
  declarations: [CandidatesPage, FilterPipe],
})
export class CandidatesPageModule {}
