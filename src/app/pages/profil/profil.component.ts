import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidatorFn } from '@angular/forms';
import { IonicModule} from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { Observable, firstValueFrom } from 'rxjs';
import { 
  IonHeader, IonToolbar, IonButtons, IonMenuButton, IonTitle, IonContent, 
  IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonItem, IonLabel, 
  IonInput, IonButton, IonText, ToastController
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-profil',
  templateUrl: './profil.component.html',
  styleUrls: ['./profil.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, ReactiveFormsModule, IonHeader, IonToolbar, IonButtons, IonMenuButton, IonTitle, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonItem, IonLabel, IonInput, IonButton, IonText]
})
export class ProfilComponent implements OnInit {
  profileForm!: FormGroup;
  successMessage: string = '';
  errorMessage: string = '';
  isAuthenticated$: Observable<boolean>;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private toastController: ToastController,
    private router: Router
  ) {
    this.isAuthenticated$ = this.authService.isAuthenticated$;
  }

  async ngOnInit() {
    await this.loadUserData();
  }

  /** ✅ Hook Ionic exécuté chaque fois que la page devient active */
  async ionViewWillEnter() {
    this.profileForm.reset();  // Réinitialisation complète
    await this.loadUserData();
  }

  async loadUserData() {
    this.profileForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      username: ['', [Validators.required, Validators.minLength(8)]],
      password: ['', [Validators.minLength(8), Validators.pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/)]],
      confirmPassword: ['']
    }, { validators: this.passwordMatchValidator });

    const uid = this.authService.getCurrentUserUid();
    if (!uid) {
      console.error("❌ Aucun UID trouvé, utilisateur non connecté.");
      return;
    }

    const userData = await firstValueFrom(this.authService.getUserData(uid));
    if (userData) {
      this.profileForm.patchValue({
        email: userData.email,
        username: userData.username
      });
    }
  }

  // ✅ Vérifie que les mots de passe correspondent
  passwordMatchValidator: ValidatorFn = (formGroup: AbstractControl): { [key: string]: boolean } | null => {
    const password = formGroup.get('password')?.value;
    const confirmPassword = formGroup.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  // ✅ Mise à jour des informations utilisateur
  async onSubmit() {
    if (this.profileForm.valid) {
      const { email, username, password, confirmPassword } = this.profileForm.value;

      try {
        // ✅ Mise à jour du profil dans le service
        await this.authService.updateUserData({ email, username, password });

        this.successMessage = "Profil mis à jour avec succès !";
        this.showToast(this.successMessage, 'success');

        // 🔄 Redirection vers home après mise à jour
        setTimeout(() => {
          this.router.navigate(['/connected-home']);
        }, 1500);

      } catch (error: any) {
        console.error('❌ Erreur mise à jour profil:', error);
        this.errorMessage = "Erreur lors de la mise à jour du profil";
        this.showToast(this.errorMessage, 'danger');
      }
    }
  }

  private async showToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color
    });
    toast.present();
  }
}