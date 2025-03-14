import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { AuthService } from './services/auth.service';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { MenuController } from '@ionic/angular/standalone';
import { ToastController } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { searchOutline, hammerOutline, logOutOutline, personOutline, flowerOutline, folderOutline, home, cameraSharp, imagesSharp, closeCircleOutline, closeCircleSharp, trashSharp, refreshOutline, trashBinOutline, cloudDoneOutline, cloudOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { 
  IonApp, IonRouterOutlet, IonMenu, IonHeader, IonContent, 
  IonList, IonItem, IonIcon, IonLabel 
} from '@ionic/angular/standalone';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ IonicModule, CommonModule, IonApp, IonRouterOutlet, IonMenu, IonHeader, IonContent, IonList, IonItem, IonIcon, IonLabel],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'my-pwa-app-fc';
  isAuthenticated$: Observable<boolean>;

  constructor(
    private authService: AuthService,
    private menuCtrl: MenuController,
    private toastController: ToastController,
    private router: Router) 
    {
    this.isAuthenticated$ = this.authService.isAuthenticated$;

    addIcons({searchOutline, hammerOutline, logOutOutline, personOutline, flowerOutline, folderOutline, home, cameraSharp, imagesSharp, closeCircleOutline, closeCircleSharp, trashSharp, refreshOutline, trashBinOutline, cloudDoneOutline, cloudOutline});
  }

   // 🔹 Déconnexion
   async logout() {
    try {
      await this.menuCtrl.close();
      await this.authService.logout();
      
      const toast = await this.toastController.create({
        message: 'Vous êtes déconnecté.',
        duration: 2000,
        position: 'bottom',
        color: 'success'
      });
      await toast.present();

    } catch (error) {
      console.error('Logout failed:', error);
    }
  }

  navigateTo(url: string) {
    this.menuCtrl.close();
    this.router.navigate([url]);
  }

}
