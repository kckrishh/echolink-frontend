import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { AuthRoutingModule } from './auth-routing.module';
import { AuthComponent } from './auth.component';
import { LoginComponent } from './login/login.component';
import { HttpClientModule } from '@angular/common/http';
import { RegisterComponent } from './register/register.component';
import { VerifyComponent } from './register/verify/verify.component';
import { OnboardingComponent } from './register/on-boarding/on-boarding.component';

@NgModule({
  declarations: [AuthComponent, LoginComponent, RegisterComponent, VerifyComponent, OnboardingComponent],
  imports: [
    CommonModule,
    AuthRoutingModule,
    ReactiveFormsModule,
    HttpClientModule,
  ],
})
export class AuthModule {}
