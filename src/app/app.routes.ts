import { Routes } from '@angular/router';
import { UnconnectedHomeComponent } from './pages/unconnected-home/unconnected-home.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { ConnectedHomeComponent } from './pages/connected-home/connected-home.component';
import { AuthGuard } from './guards/auth.guard';
import { ProfilComponent } from './pages/profil/profil.component';


export const routes: Routes = [
    { path: '', component: UnconnectedHomeComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'login', component: LoginComponent, },
    { path: 'connected-home', component: ConnectedHomeComponent, canActivate: [AuthGuard] },
    { path: 'profil', component: ProfilComponent, canActivate: [AuthGuard] }
];
