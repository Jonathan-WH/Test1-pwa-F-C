import { Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, UserCredential, updateEmail, updatePassword, sendPasswordResetEmail } from '@angular/fire/auth';
import { Firestore, doc, setDoc, getDoc, query, where, collection, getDocs } from '@angular/fire/firestore';
import { docData } from 'rxfire/firestore';
import { Observable, BehaviorSubject, of, firstValueFrom, switchMap, map, shareReplay } from 'rxjs';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular/standalone';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private usernameSubject = new BehaviorSubject<string>('Utilisateur inconnu');
  public username$: Observable<string>;

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(
    private auth: Auth,
    private firestore: Firestore,
    private router: Router,
    private toastController: ToastController
  ) {
    this.checkInitialAuthState(); // Vérifie l'état initial

    this.username$ = this.isAuthenticated$.pipe(
      switchMap(isAuth => {
        if (!isAuth) return of("Utilisateur inconnu");
        const uid = this.getCurrentUserUid();
        if (!uid) return of("Utilisateur inconnu");
        return this.getUserObservable(uid).pipe(map(userData => userData?.username || "Utilisateur inconnu"));
      }),
      shareReplay(1) // ⚡ Évite les requêtes Firestore inutiles
    );
  }

  // 🔹 Vérifie l'état initial basé sur le token et Firebase authState
  private async checkInitialAuthState() {
    const token = localStorage.getItem('jwt_token');
    const firebaseUser = this.auth.currentUser;

    if (!token || !firebaseUser) {
      this.isAuthenticatedSubject.next(false);
      return;
    }

    try {
      const decodedToken = this.decodeToken(token);
      if (!decodedToken || decodedToken.uid !== firebaseUser.uid || this.isTokenExpired(decodedToken.exp)) {
        this.isAuthenticatedSubject.next(false);
        this.logoutWithMessage("Votre session a expiré. Veuillez vous reconnecter.");
      } else {
        this.isAuthenticatedSubject.next(true);
      }
    } catch (error) {
      console.error("🚨 Erreur de validation du token:", error);
      this.isAuthenticatedSubject.next(false);
      this.logoutWithMessage("Erreur d'authentification. Veuillez vous reconnecter.");
    }
  }

  // 🔹 Vérifie si un email ou un username existent déjà
  async checkUserExists(email: string, username: string): Promise<{ emailExists: boolean; usernameExists: boolean }> {
    const usersRef = collection(this.firestore, 'users');

    const emailSnapshot = await getDocs(query(usersRef, where("email", "==", email)));
    const usernameSnapshot = await getDocs(query(usersRef, where("username", "==", username)));

    return { emailExists: !emailSnapshot.empty, usernameExists: !usernameSnapshot.empty };
  }

  // 🔹 Inscription d'un utilisateur
  async register(email: string, password: string, username: string): Promise<UserCredential> {
    const { emailExists, usernameExists } = await this.checkUserExists(email, username);
    if (emailExists) throw new Error("Cet email est déjà utilisé.");
    if (usernameExists) throw new Error("Ce nom d'utilisateur est déjà pris.");

    const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
    await setDoc(doc(this.firestore, `users/${userCredential.user.uid}`), { email, username, createdAt: new Date() });

    const token = await userCredential.user.getIdToken();
    localStorage.setItem('jwt_token', token);

    this.setAuthenticated(true);
    return userCredential;
  }

  // 🔹 Connexion utilisateur
  async login(email: string, password: string): Promise<UserCredential> {
    const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
    const token = await userCredential.user.getIdToken();
    localStorage.setItem('jwt_token', token);

    this.setAuthenticated(true);
    return userCredential;
  }

  // 🔹 Déconnexion utilisateur
  async logout() {
    localStorage.removeItem('jwt_token');
    this.isAuthenticatedSubject.next(false);
    await signOut(this.auth);
  }

  async logoutWithMessage(message: string) {
    await this.logout();
    this.showToast(message, 'warning');
  }

  // 🔹 Récupère les données utilisateur depuis Firestore
  getUserData(uid: string): Observable<any> {
    return docData(doc(this.firestore, `users/${uid}`));
  }

  // 🔹 Récupère l'UID de l'utilisateur connecté
  getCurrentUserUid(): string | null {
    return this.auth.currentUser ? this.auth.currentUser.uid : null;
  }

  /** ✅ Vérifie si un token est valide et non expiré */
  async isAuthenticated(): Promise<boolean> {
    const token = localStorage.getItem('jwt_token');
    if (!token) {
      this.isAuthenticatedSubject.next(false);
      return false;
    }

    try {
      const payload = this.decodeToken(token);
      if (!payload || this.isTokenExpired(payload.exp)) {
        this.isAuthenticatedSubject.next(false);
        this.logoutWithMessage("Votre session a expiré. Veuillez vous reconnecter.");
        return false;
      }

      this.isAuthenticatedSubject.next(true);
      return true;
    } catch (error) {
      console.error("🚨 Erreur lors de la vérification du token:", error);
      this.isAuthenticatedSubject.next(false);
      this.logoutWithMessage("Erreur d'authentification. Veuillez vous reconnecter.");
      return false;
    }
  }

  /**Décode le token JWT */
  private decodeToken(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(atob(base64));
    } catch (error) {
      console.error("Impossible de décoder le token:", error);
      return null;
    }
  }

  /** ✅ Vérifie si le token est expiré */
  private isTokenExpired(exp: number): boolean {
    return !exp || Math.floor(Date.now() / 1000) >= exp;
  }

  /** 📌 Affichage d'un Toast */
  async showToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      position: 'top',
      color: color
    });
    await toast.present();
  }

  async updateUserData(updatedData: { email: string; username: string; password?: string }) {
    const user = this.auth.currentUser;
    if (!user) throw new Error("Utilisateur non connecté.");

    if (updatedData.email) await updateEmail(user, updatedData.email);
    if (updatedData.password) await updatePassword(user, updatedData.password);

    await setDoc(doc(this.firestore, `users/${user.uid}`), updatedData, { merge: true });
    this.usernameSubject.next(updatedData.username);
  }

  setUsername(newUsername: string) {
    this.usernameSubject.next(newUsername);
  }

  setAuthenticated(isAuth: boolean) {
    this.isAuthenticatedSubject.next(isAuth);
  }

  getUserObservable(uid: string): Observable<any> {
    return docData(doc(this.firestore, `users/${uid}`));
  }

  /** 📌 Fonction de réinitialisation du mot de passe */
  async resetPassword(email: string) {
    try {
      await sendPasswordResetEmail(this.auth, email);
      console.log('Password reset email sent');
    } catch (error) {
      console.error('Reset password error:', error);
      throw new Error('Failed to send password reset email.');
    }
  }
}