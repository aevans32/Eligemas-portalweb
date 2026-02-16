import { Component } from '@angular/core';
import { Footer } from "../shared/components/footer/footer";
import { Header } from "../shared/components/header/header";

@Component({
  selector: 'app-proposito',
  imports: [Footer, Header],
  templateUrl: './proposito.html',
  styleUrl: './proposito.css',
})
export class Proposito {

}
