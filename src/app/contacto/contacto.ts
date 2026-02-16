import { Component } from '@angular/core';
import { Footer } from "../shared/components/footer/footer";
import { Header } from "../shared/components/header/header";

@Component({
  selector: 'app-contacto',
  imports: [Footer, Header],
  templateUrl: './contacto.html',
  styleUrl: './contacto.css',
})
export class Contacto {

}
