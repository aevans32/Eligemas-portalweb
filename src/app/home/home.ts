import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Header } from '../shared/components/header/header';
import { Footer } from '../shared/components/footer/footer';
import { RouterLink } from '@angular/router';

type HeroAlign = 'left' | 'right';

type HeroSlide = {
  src: string;
  alt: string;
  title: string;
  subtitle: string;
  align: HeroAlign;
};

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, Header, Footer, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit, OnDestroy {
  slides: HeroSlide[] = [
    {
      src: 'images/home/hero2.png',
      alt: 'Elige Plus - Hero 2',
      align: 'right',
      title: 'Bienvenido a Elige +',
      subtitle: 'Decide dónde pagar menos por el mismo préstamo. Transparente, fácil y 100% digital',
    },
    {
      src: 'images/home/hero3.png',
      alt: 'Elige Plus - Hero 3',
      align: 'left',
      title: 'Refinancia tu deuda desde un solo lugar',
      subtitle: 'Gestiona el traslado de tu Crédito Vehicular desde un solo lugar.',
    },
    {
      src: 'images/home/hero4.png',
      alt: 'Elige Plus - Hero 4',
      align: 'right',
      title: 'Tu información, siempre protegida',
      subtitle: 'Trabajamos con estándares de seguridad para cuidar tus datos mientras buscas mejores condiciones.',
    },
  ];

  currentIndex = 0;

  // Ajusta a tu gusto
  private readonly intervalMs = 4500;
  private timerId: number | null = null;

  get currentSlide(): HeroSlide {
    return this.slides[this.currentIndex];
  }

  ngOnInit(): void {
    this.startAutoPlay();
  }

  ngOnDestroy(): void {
    this.stopAutoPlay();
  }

  startAutoPlay(): void {
    this.stopAutoPlayInternal();

    this.timerId = window.setInterval(() => {
      this.next();
    }, this.intervalMs);
  }

  stopAutoPlay(): void {
    this.stopAutoPlayInternal();
  }

  // helper interno (este sí puede ser private)
  private stopAutoPlayInternal(): void {
    if (this.timerId !== null) {
      window.clearInterval(this.timerId);
      this.timerId = null;
    }
  }


  next(): void {
    this.currentIndex = (this.currentIndex + 1) % this.slides.length;
  }

  prev(): void {
    this.currentIndex = (this.currentIndex - 1 + this.slides.length) % this.slides.length;
  }

  goTo(i: number): void {
    if (i < 0 || i >= this.slides.length) return;
    this.currentIndex = i;
  }
}
