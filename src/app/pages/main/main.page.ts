import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.page.html',
  styleUrls: ['./main.page.scss'],
})
export class MainPage implements OnInit {
  pages = [
    { title: 'Inicio', url: '/main/home', icon: 'home-outline' },
    { title: 'Candidatos', url: '/main/candidates', icon: 'people-outline' },
    { title: 'Perfil', url: '/main/profile', icon: 'person-outline' },
    {
      title: 'Registrar usuario',
      url: '/main/sign-up-user',
      icon: 'person-add-outline',
      role: 'admin', 
    },
    { title: 'Chat', url: '/main/chat', icon: 'chatbubble-outline' },
  ];

  filteredPages = [];
  router = inject(Router);
  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService);
  currentPath: string = '';
  isMenuOpen = false; 

  ngOnInit() {
    this.router.events.subscribe((event: any) => {
      if (event?.url) this.currentPath = event.url;
    });

    this.filterPagesByRole();
  }

  toggleMenu(isOpen: boolean) {
    this.isMenuOpen = isOpen;
  }

  signOut() {
    this.firebaseSvc.signOut();
  }

  // Método para ocultar una navegacion a un rol que no se le puede asiganar esa navegacion dnetro de la plicacion
  async filterPagesByRole() {
    const user = this.firebaseSvc.getAuth().currentUser;
    if (user) {
      const userRole = await this.firebaseSvc.getUserRole(user.uid);

      this.filteredPages = this.pages.filter(page => !page.role || page.role === userRole);
    } else {
      this.filteredPages = this.pages.filter(page => !page.role);
    }
  }
}
