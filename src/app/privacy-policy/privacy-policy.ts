import { Component } from '@angular/core';
import { Header } from "../shared/components/header/header";
import { Footer } from "../shared/components/footer/footer";
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-privacy-policy',
  imports: [Header, Footer],
  templateUrl: './privacy-policy.html',
  styleUrl: './privacy-policy.css',
})
export class PrivacyPolicy {

}
