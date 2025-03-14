import { Component, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MenuController } from '@ionic/angular';
import { 
  IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent, 
  IonItem, IonLabel, IonInput, IonText, IonButton 
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  standalone: true,
  imports: [IonicModule, ReactiveFormsModule, CommonModule, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonItem, IonLabel, IonInput, IonText, IonButton]
})
export class RegisterComponent {
  registerForm: FormGroup;
  errorMessage: string | null = null; // Pour afficher les erreurs Firebase

  constructor(
    private fb: FormBuilder, 
    private authService: AuthService, 
    private router: Router,
    private menuCtrl: MenuController) {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      username: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9]{8,}$/)]],
      password: ['', [Validators.required, Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }


  ngOnInit() {
    this.registerForm.reset();
    this.errorMessage = '';
  }

  ionviewWillEnter() {
    this.registerForm.reset();
    this.errorMessage = '';
  }

  // Vérification que les mots de passe correspondent
  private passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password')?.value?.trim();
    const confirmPassword = group.get('confirmPassword')?.value?.trim();
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  // Nettoyage des espaces inutiles
  private trimFormValues() {
    this.registerForm.patchValue({
      email: this.registerForm.value.email.trim(),
      username: this.registerForm.value.username.trim(),
      password: this.registerForm.value.password.trim(),
      confirmPassword: this.registerForm.value.confirmPassword.trim()
    });
  }

  // Bloquer l'espace sur les champs concernés
  blockSpace(event: KeyboardEvent) {
    if (event.key === ' ') {
      event.preventDefault();
    }
  }

  // Supprimer les espaces en cas de copier-coller
  removeSpacesOnPaste(event: ClipboardEvent, controlName: string) {
    event.preventDefault();
    const pastedText = event.clipboardData?.getData('text') || '';
    const cleanText = pastedText.replace(/\s+/g, ''); // Supprime tous les espaces
    this.registerForm.get(controlName)?.setValue(cleanText);
  }

  // Getters pour les inputs
  get email() { return this.registerForm.get('email')!; }
  get username() { return this.registerForm.get('username')!; }
  get password() { return this.registerForm.get('password')!; }
  get confirmPassword() { return this.registerForm.get('confirmPassword')!; }

  async onRegister() {
    if (this.registerForm.valid) {
      this.trimFormValues(); // Nettoyer les entrées
      const { email, password, username } = this.registerForm.value;
      
      try {
        await this.authService.register(email, password, username);
  
        // Mise à jour immédiate de l'état d'authentification
        this.authService.setAuthenticated(true);
  
        // Activation et ouverture du menu après inscription
        this.menuCtrl.enable(true);
  
        // Redirection vers la page connectée
        this.router.navigate(['/connected-home']); 
  
      } catch (error: any) {
        this.errorMessage = error.message; // Afficher l'erreur Firebase
      }
    }
  }

  navigateTo(url: string) {
    this.menuCtrl.close();
    this.router.navigate([url]);
  }
}