import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { AnimationController } from '@ionic/angular';
import { 
  IonContent, IonCard, IonCardHeader, IonCardTitle, 
  IonCardContent, IonButton 
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-unconnected-home',
  templateUrl: './unconnected-home.component.html',
  styleUrls: ['./unconnected-home.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton]
})
export class UnconnectedHomeComponent implements AfterViewInit {
  @ViewChild('fadeElement', { static: false }) fadeElement!: ElementRef;

  constructor(private router: Router, private animationCtrl: AnimationController) {}

  ngAfterViewInit() {
    
  }


  navigateTo(url: string) {
    this.router.navigate([url]);
  }
}