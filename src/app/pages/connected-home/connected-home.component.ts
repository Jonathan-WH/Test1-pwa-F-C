import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { MenuController } from '@ionic/angular/standalone';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IdeaService } from '../../services/idea.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { addIcons } from 'ionicons';
import { trashOutline } from 'ionicons/icons';
import { Observable, BehaviorSubject, map } from 'rxjs';
import { ClockService } from '../../services/clock.service';
import { AlertController } from '@ionic/angular';
import { 
  IonHeader, IonToolbar, IonButtons, IonMenuButton, IonTitle, IonContent, 
  IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonItem, IonLabel, 
  IonInput, IonTextarea, IonButton, IonIcon, IonGrid, IonRow, IonCol, IonList, IonText
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-connected-home',
  templateUrl: './connected-home.component.html',
  styleUrls: ['./connected-home.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule, IonHeader, IonToolbar, IonButtons, IonMenuButton, IonTitle, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonItem, IonLabel, IonInput, IonTextarea, IonButton, IonIcon, IonGrid, IonRow, IonCol, IonList, IonText]
})
export class ConnectedHomeComponent implements OnInit {

  username: string = "";
  isAuthenticated$: Observable<boolean>;
  currentDate: string = new Date().toLocaleDateString();
  ideaForm: FormGroup;
  ideas: any[] = [];
  username$: Observable<string>;
  worldClock$: Observable<{ 
  name: string; 
  digitalTime: string;  // ✅ Ajout de la propriété ici
  hourAngle: number; 
  minuteAngle: number; 
  secondAngle: number;
  }[]>;

  constructor(
    private authService: AuthService,
    private router: Router,
    private menuCtrl: MenuController,
    private fb: FormBuilder,
    private ideaService: IdeaService,
    private clockService: ClockService,
    private alertController: AlertController
  ) {
    // Initialisation du formulaire
    this.ideaForm = this.fb.group({
      title: ['', Validators.required],
      content: ['', Validators.required]
    });

    // Initialisation des Observables
    this.isAuthenticated$ = this.authService.isAuthenticated$;
    this.worldClock$ = this.clockService.clock$;

    this.username$ = this.authService.username$.pipe(
      map(username => username || 'Utilisateur inconnu')
    );

    addIcons({ trashOutline });

  }

  async ngOnInit() {
    const isAuth = await this.authService.isAuthenticated();
    if (!isAuth) {
      this.router.navigate(['/login']); // Redirection si non authentifié
      return;
    }

    const uid = this.authService.getCurrentUserUid();
    if (uid) {
      try {
        const userData = await firstValueFrom(this.authService.getUserData(uid));
        if (userData) {
          this.username = userData.username;
        }
      } catch (error) {
        console.error("Erreur lors de la récupération du nom d'utilisateur :", error);
      }
    }

    this.loadIdeas();  // ⬅️ Charge les idées

    this.ideaForm.reset();
  }

  ionviewWillEnter() {
    this.ideaForm.reset();
  }

  // 🔹 Ajoute une idée
  addIdea() {
    if (this.ideaForm.valid) {
      const newIdea = {
        title: this.ideaForm.value.title,
        content: this.ideaForm.value.content,
        date: new Date().toISOString(),
      };

      const uid = this.authService.getCurrentUserUid();
      if (!uid) return;

      this.ideaService.addIdea(uid, newIdea).then(() => {
        this.ideas.push(newIdea);
        this.ideaForm.reset();
      }).catch(error => {
        console.error("Erreur lors de l'ajout :", error);
      });
    }
  }

  // 🔹 Charge les idées depuis Firestore
  async loadIdeas() {
    const uid = this.authService.getCurrentUserUid();
    if (!uid) return;

    try {
      this.ideas = await this.ideaService.getIdeas(uid);
    } catch (error) {
      console.error("Erreur lors du chargement :", error);
    }
  }

  // 🔹 Supprime une idée avec confirmation
async confirmDeleteIdea(ideaId: string) {
  const alert = await this.alertController.create({
    header: 'Confirmer la suppression',
    message: 'Voulez-vous vraiment supprimer cette idée ? Cette action est irréversible.',
    buttons: [
      {
        text: 'Annuler',
        role: 'cancel',
        cssClass: 'secondary'
      },
      {
        text: 'Supprimer',
        handler: () => {
          this.deleteIdea(ideaId);
        }
      }
    ]
  });

  await alert.present();
}

// 🔹 Supprime une idée après confirmation
deleteIdea(ideaId: string) {
  const uid = this.authService.getCurrentUserUid();
  if (!uid) return;

  this.ideaService.deleteIdea(uid, ideaId).then(() => {
    this.ideas = this.ideas.filter(idea => idea.id !== ideaId);
  }).catch(error => {
    console.error("Erreur lors de la suppression :", error);
  });
}

 
  // 🔹 Navigation
  navigateTo(url: string) {
    this.router.navigate([url]);
  }

  trackByCity(index: number, city: { name: string }) {
    return city.name;
  }

   
}