import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../auth.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Login, UserLoginResponse } from '../types/login-response.type';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { take } from 'rxjs';
import { UserManagementUseCase } from '../../../user-management/domain/usecase/user-management-usecase';
import { UserDataSession } from '../interfaces/models/user-data-session.model';
import { User } from '../../interfaces/models/user.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CheckboxModule,
    InputTextModule,
    ButtonModule,
    FormsModule,
    PasswordModule,
    RouterModule,
    ConfirmDialogModule,
    ToastModule,
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  userDataSession: Partial<UserDataSession> = {};
  isLoadingLogin = false;

  private readonly authService = inject(AuthService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);
  private readonly userManagementUseCase = inject(UserManagementUseCase);

  constructor() {}

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      username: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
  }

  onLoginFormSubmitted() {
    if (!this.loginForm.valid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoadingLogin = true;

    this.authService.login(this.loginForm.value).subscribe({
      next: async (res: UserLoginResponse) => {
        const user = res.user;
        this.userDataSession.userId = user.userId;
        this.userDataSession.email = user.email;
        this.userDataSession.userRoles = user.userRoles;

        await this.getPersonByUserId();
        await this.getTeacherByPersonId();

        this.router.navigate(['/']);
        this.isLoadingLogin = false;
      },
      error: (error) => {
        console.error(error);
        this.isLoadingLogin = false;
      },
    });
  }

  async getPersonByUserId() {
    return new Promise((resolve) => {
      if (!this.userDataSession.userId) return resolve(false);

      this.userManagementUseCase
        .getPersonByUserId(this.userDataSession.userId)
        .subscribe({
          next: (response: any) => {
            this.userDataSession.personId = response.personId;
            this.userDataSession.nombres =
              `${response.firstName ?? ''} ${response.secondName ?? ''}`.trim();
            this.userDataSession.apellidos =
              `${response.firstLastName ?? ''} ${response.secondLastName ?? ''}`.trim();
            this.userDataSession.configurationId = response.configurationId;
            resolve(true);
          },
          error: () => resolve(false),
        });
    });
  }

  async getTeacherByPersonId() {
    return new Promise((resolve) => {
      if (!this.userDataSession.personId) return resolve(false);

      this.userManagementUseCase
        .getTeacherByPersonId(this.userDataSession.personId)
        .subscribe({
          next: (response: any) => {
            if (response !== null) {
              this.userDataSession.teacherId = response.teacherId;
            }
            resolve(true);
          },
          error: () => resolve(false),
        });
    });
  }
}
