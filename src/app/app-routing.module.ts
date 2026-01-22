import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MyProfileComponent } from './nav/panels/profile-panel/my-profile/my-profile.component';
import { PeopleComponent } from './nav/panels/profile-panel/people/people.component';
import { authGuard } from './auth/auth.guard';

const routes: Routes = [
  {
    path: 'chat',
    loadChildren: () => import('./chat/chat.module').then((m) => m.ChatModule),
    canActivate: [authGuard],
  },
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.module').then((m) => m.AuthModule),
    data: { hideNavbar: true },
  },
  {
    path: 'profile',
    component: MyProfileComponent,
    canActivate: [authGuard],
  },
  {
    path: 'people',
    component: PeopleComponent,
    canActivate: [authGuard],
  },
  {
    path: '**',
    redirectTo: 'chat',
  },
  {
    path: '',
    redirectTo: 'chat',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
