import { Component } from '@angular/core';
import { Header } from "../shared/components/header/header";
import { Footer } from "../shared/components/footer/footer";

@Component({
  selector: 'app-solicitud-details',
  imports: [Header, Footer],
  templateUrl: './solicitud-details.html',
  styleUrl: './solicitud-details.css',
})
export class SolicitudDetails {

}
