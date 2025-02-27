import { Injectable, inject } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import {
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { User } from '../models/user.model';
import {
  getFirestore,
  setDoc,
  doc,
  getDoc,
  addDoc,
  collection,
} from '@angular/fire/firestore';
import { UtilsService } from './utils.service';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import {
  getStorage,
  uploadString,
  ref,
  getDownloadURL,
} from 'firebase/storage';
import { Curriculum } from '../models/curriculum.model';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { CurriculumStatus } from 'src/app/models/curriculum-status.model'; 

@Injectable({
  providedIn: 'root',
})
export class FirebaseService {
  auth = inject(AngularFireAuth);
  firestore = inject(AngularFirestore);
  Firestore = inject(AngularFireStorage);
  storage = inject(AngularFireStorage);
  utilsSvc = inject(UtilsService);

  // -------------------------- Autenticacion --------------------------------

  getAuth() {
    return getAuth();
  }

  // ---------- Acceder ------------

  signIn(user: User) {
    return signInWithEmailAndPassword(getAuth(), user.email, user.password);
  }

  // ---------- Registrar Usuarios ------------

  signUp(user: User) {
    return createUserWithEmailAndPassword(getAuth(), user.email, user.password);
  }

  // ---------- Crear Usuario sin iniciar sesión ------------

  async createUserWithoutSignIn(data: {
    email: string;
    password: string;
    displayName: string;
    role: string;
  }) {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    const currentUserEmail = currentUser?.email || '';
    const currentUserPassword = prompt(
      'Por favor, ingresa tu contraseña para continuar:'
    );

    if (!currentUserPassword) {
      throw new Error(
        'Se requiere la contraseña del usuario actual para continuar.'
      );
    }

    try {
      
      const newUser = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

      
      await updateProfile(newUser.user, { displayName: data.displayName });

      
      await this.setDocument(`users/${newUser.user.uid}`, {
        uid: newUser.user.uid, 
        email: data.email,
        displayName: data.displayName,
        role: data.role,
      });

      
      if (currentUserEmail) {
        await signInWithEmailAndPassword(
          auth,
          currentUserEmail,
          currentUserPassword
        );
      }

      return newUser.user.uid;
    } catch (error) {
      console.error(
        'Error al crear el usuario o volver a iniciar sesión:',
        error
      );
      throw error;
    }
  }

  // ---------- Actualizar Usuarios ------------

  updateUser(displayName: string) {
    return updateProfile(getAuth().currentUser, { displayName });
  }

  // ---------- Cerrar Sesion --------------

  signOut() {
    getAuth().signOut();
    localStorage.removeItem('user');
    this.utilsSvc.routerLink('/auth');
    window.location.reload();
  }

  // ------------------------ Base de datos --------------------------

  // --------- Setear Documento -----------

  setDocument(path: string, data: any) {
    return setDoc(doc(getFirestore(), path), data);
  }

  // --------- Obtener Documento -----------

  async getDocument(path: string) {
    return (await getDoc(doc(getFirestore(), path))).data();
  }

  // ---------- Agregar Documento -------------

  addDocument(path: string, data: any) {
    return addDoc(collection(getFirestore(), path), data);
  }

  // ---------- Crear ID -------------

  createId(): string {
    return this.firestore.createId();
  }

  // -------- Obtener informacion del usuario -----------

  async getUserProfile(uid: string): Promise<User | undefined> {
    const userDoc = await this.getDocument(`users/${uid}`);
    return userDoc ? (userDoc as User) : undefined;
  }

  async getAllCurriculums(): Promise<Curriculum[]> {
    const snapshot = await this.firestore.collection('curriculums').get().toPromise();
    return snapshot.docs.map(doc => {
      const data = doc.data() as Curriculum;
      return { id: doc.id, ...data };
    });
  }

  // ------- Obtener currículums por usuario --------------
  async getCurriculumsByUser(uid: string): Promise<Curriculum[]> {
    const snapshot = await this.firestore
      .collection('curriculums', (ref) => ref.where('userId', '==', uid))
      .get()
      .toPromise();
    return snapshot.docs.map((doc) => {
      const data = doc.data() as Curriculum;
      return { id: doc.id, ...data };
    });
  }

  // ------ Eliminar currículum --------
  async deleteCurriculum(curriculumId: string): Promise<void> {
    try {
      // Eliminar el currículum de Firestore
      await this.firestore.collection('curriculums').doc(curriculumId).delete();
    } catch (error) {
      throw new Error('Error al eliminar el currículum de Firestore');
    }
  }

  // -------- Eliminar archivo de Firebase Storage ---------
  async deleteFileFromStorage(fileUrl: string): Promise<void> {
    try {
      const fileRef = this.storage.refFromURL(fileUrl);
      await fileRef.delete();
    } catch (error) {
      throw new Error('Error al eliminar el archivo de Firebase Storage');
    }
  }

  updateCurriculum(curriculum: Curriculum) {
    return this.firestore.collection('curriculums').doc(curriculum.id).update(curriculum);
  }

  // --------- Crear Currículum -----------

  async createCurriculum(curriculum: Curriculum, file: File) {
    const filePath = `curriculums/${curriculum.userId}/${curriculum.id}/${file.name}`;
    const fileRef = this.storage.ref(filePath);

    await fileRef.put(file);

    const pdfUrl = await fileRef.getDownloadURL().toPromise();

    curriculum.pdfUrl = pdfUrl;

    return this.firestore.collection('curriculums').doc(curriculum.id).set(curriculum);
  }

  // ----------------------- Subir Documento PDF ------------------------

  // --------- Subir CVs ----------

  async uploadDoc(path: string, data_url: string) {
    return uploadString(ref(getStorage(), path), data_url, 'data_url').then(
      () => {
        return getDownloadURL(ref(getStorage(), path));
      }
    );
  }

  // ----------------------- Manejo de Roles ------------------------

  // --------- Actualizar Rol del Usuario -----------

  updateUserRole(uid: string, role: string) {
    return this.setDocument(`users/${uid}`, { role });
  }

  // --------- Obtener Rol del Usuario -------------

  async getUserRole(uid: string): Promise<string | undefined> {
    const userDoc = await this.getDocument(`users/${uid}`);
    return userDoc ? userDoc['role'] : undefined; 
  }

  // --------- Obtener candidatos por estado -----------
  async getCandidatesByStatus(status: CurriculumStatus): Promise<Curriculum[]> {
    try {
      const snapshot = await this.firestore
        .collection('curriculums', (ref) => ref.where('status', '==', status))
        .get()
        .toPromise();

      return snapshot.docs.map((doc) => {
        const data = doc.data() as Curriculum;
        return { id: doc.id, ...data };
      });
    } catch (error) {
      console.error('Error al obtener candidatos por estado:', error);
      throw error;
    }
  }
}