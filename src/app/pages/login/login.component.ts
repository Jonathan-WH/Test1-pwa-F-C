import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { IonicModule, MenuController } from '@ionic/angular';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Observable, firstValueFrom } from 'rxjs';
import { 
  IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent, 
  IonItem, IonLabel, IonInput, IonText, IonButton 
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [IonicModule, ReactiveFormsModule, CommonModule, FormsModule, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonItem, IonLabel, IonInput, IonText, IonButton]
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string | null = null;
  isAuthenticated$: Observable<boolean>;
  showResetPassword: boolean = false;
  resetEmail: string = '';
  resetSuccessMessage: string = '';
  resetErrorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private menuCtrl: MenuController
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });

    this.isAuthenticated$ = this.authService.isAuthenticated$; 
  }

  ngOnInit() {
    this.loginForm.reset();
    this.errorMessage = '';
  }

  ionViewWillEnter() {
    this.loginForm.reset();
    this.errorMessage = '';
    this.showResetPassword = false;
    this.resetEmail = '';
    this.resetSuccessMessage = '';
    this.resetErrorMessage = '';
  }

  // Bloquer l’espace lors de la saisie
  blockSpace(event: KeyboardEvent) {
    if (event.key === ' ') {
      event.preventDefault();
    }
  }

  // Nettoyer les espaces en cas de copier-coller
  removeSpacesOnPaste(event: ClipboardEvent, controlName: string) {
    event.preventDefault();
    const pastedText = event.clipboardData?.getData('text') || '';
    const cleanText = pastedText.replace(/\s+/g, '');
    this.loginForm.get(controlName)?.setValue(cleanText);
  }

  get email() { return this.loginForm.get('email')!; }
  get password() { return this.loginForm.get('password')!; }

  async onLogin() {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      this.errorMessage = '';
  
      try {
        await this.authService.login(email, password);
  
        // ✅ Attendre la première valeur `true` de `isAuthenticated$`
        const isAuth = await firstValueFrom(this.authService.isAuthenticated$);
  
        if (isAuth) {
          this.menuCtrl.enable(true); // ✅ Active le menu
          this.menuCtrl.open();       // ✅ Ouvre le menu
          this.router.navigate(['/connected-home']); // ✅ Redirection immédiate
        }
  
      } catch (error: any) {
        this.errorMessage = "Email ou mot de passe incorrect.";
      }
    }
  }

  navigateTo(url: string) {
    this.menuCtrl.close();
    this.router.navigate([url]);
  }

  // 🔄 Affiche/cache le champ de reset password
  toggleResetPassword() {
    this.showResetPassword = !this.showResetPassword;
    this.resetEmail = '';
    this.resetSuccessMessage = '';
    this.resetErrorMessage = '';
  }

  // 📧 Envoie un email de réinitialisation du mot de passe
  async sendResetPasswordEmail() {
    if (!this.resetEmail) {
      this.resetErrorMessage = "Entrer un mail valide.";
      return;
    }

    if (!this.resetEmail.includes('@')) {
      this.resetErrorMessage = "Entrer un mail valide.";
      return;
    }



    try {
      await this.authService.resetPassword(this.resetEmail);
      this.resetSuccessMessage = "Le mail de réinitialisation a été envoyé.";
      this.resetErrorMessage = '';
    } catch (error) {
      console.error("Reset password error:", error);
      this.resetErrorMessage = "Failed to send reset email. Please try again.";
    }
  }
}