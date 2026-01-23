import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavComponent } from './nav/nav.component';

import {
  Home,
  Bell,
  Settings,
  User,
  LucideAngularModule,
  ChevronDown,
  IdCard,
  Users,
  ShieldAlert,
  LogOut,
  Lock,
  ImagePlus,
  BadgeCheck,
  ChevronUp,
  Check,
  Search,
} from 'lucide-angular';

import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { AuthInterceptor } from './auth/auth.interceptor';
import { FormsModule } from '@angular/forms';
import { MyProfileComponent } from './nav/panels/profile-panel/my-profile/my-profile.component';
import { PeopleComponent } from './nav/panels/profile-panel/people/people.component';
import { RefreshInterceptor } from './auth/refresh.interceptor';

@NgModule({
  declarations: [
    AppComponent,
    NavComponent,
    MyProfileComponent,
    PeopleComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    FormsModule,
    LucideAngularModule.pick({
      Home,
      Bell,
      Settings,
      User,
      ChevronDown,
      ChevronUp,
      IdCard,
      Users,
      ShieldAlert,
      LogOut,
      Lock,
      ImagePlus,
      BadgeCheck,
      Check,
      Search,
    }),
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: RefreshInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
