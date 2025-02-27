export interface User {
  uid: string;
  email: string;
  password: string;
  displayName: string;
  role: 'admin' | 'user';
}
