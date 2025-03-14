import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private auth: Auth, private router: Router) {}

  async canActivate(): Promise<boolean> {
    // 🔹 Vérifie si Firebase reconnait un utilisateur
    const firebaseUser = await new Promise<any>((resolve) => {
      this.auth.onAuthStateChanged(resolve);
    });
    
    // 🔹 Vérifie si un token existe en localStorage
    const token = localStorage.getItem('jwt_token');

    if (!firebaseUser || !token) {
      this.router.navigate(['/login']); // ❌ Redirige si aucun token ou utilisateur Firebase
      return false;
    }

    // 🔹 Décode le token
    const decodedToken = this.decodeToken(token);

    // 🔹 Vérifie que l'UID du token correspond à Firebase
    if (!decodedToken || decodedToken.uid !== firebaseUser.uid || this.isTokenExpired(decodedToken.exp)) {
      this.router.navigate(['/login']); // ❌ Redirige si le token est invalide ou expiré
      return false;
    }

    return true; // ✅ Autorise l'accès si tout est OK
  }

  /** ✅ Décode le token JWT */
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
    if (!exp) return true;
    const now = Math.floor(Date.now() / 1000);
    return now >= exp;
  }
}