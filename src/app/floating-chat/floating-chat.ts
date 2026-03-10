import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-floating-chat',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './floating-chat.html',
  styleUrl: './floating-chat.scss',
})
export class FloatingChatComponent {
  isOpen = false;

  readonly asesorHumanoUrl = 'https://wa.me/51967334184';
  readonly asesorIAUrl = 'https://wa.pe/14155238886';

  openMenu(): void {
    this.isOpen = true;
  }

  closeMenu(): void {
    this.isOpen = false;
  }

  openLink(url: string): void {
    window.location.href = url;
  }
}
