import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('compra-deuda-alpha-app');

  private auth = inject(AuthService);

  async ngOnInit() {
    console.log('App ngOnInit auth initialized');
    await this.auth.init();
  }
}
