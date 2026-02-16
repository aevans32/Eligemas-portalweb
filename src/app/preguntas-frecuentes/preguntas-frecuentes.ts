import { Component } from '@angular/core';
import { Footer } from "../shared/components/footer/footer";
import { Header } from "../shared/components/header/header";

@Component({
  selector: 'app-preguntas-frecuentes',
  imports: [Footer, Header],
  templateUrl: './preguntas-frecuentes.html',
  styleUrl: './preguntas-frecuentes.css',
})
export class PreguntasFrecuentes {

}
