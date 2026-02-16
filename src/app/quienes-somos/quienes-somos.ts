import { Component } from '@angular/core';
import { Footer } from "../shared/components/footer/footer";
import { Header } from "../shared/components/header/header";

@Component({
  selector: 'app-quienes-somos',
  imports: [Footer, Header],
  templateUrl: './quienes-somos.html',
  styleUrl: './quienes-somos.css',
})
export class QuienesSomos {

}
