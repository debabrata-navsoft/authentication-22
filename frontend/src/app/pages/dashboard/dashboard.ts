import { Component, inject, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { LucideDynamicIcon } from '@lucide/angular';
import { AuthService } from '../../core/services/auth.service';

@Component({
  imports: [DatePipe, LucideDynamicIcon],
  selector: 'app-dashboard',
  styleUrl: './dashboard.css',
  templateUrl: './dashboard.html',
})
export class Dashboard implements OnInit {
  protected readonly authService = inject(AuthService);
  protected readonly user = this.authService.user;

  ngOnInit(): void {
    this.authService.getMe().subscribe({ error: () => {} });
  }

  protected logout(): void {
    this.authService.logout();
  }
}
