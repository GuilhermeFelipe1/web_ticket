import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DatePipe, NgFor, NgIf } from '@angular/common';
import { SistemaAtendimento } from './sistema-atendimento';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    DatePipe,
    NgFor,
    NgIf
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {

  sistema = new SistemaAtendimento();
  protected readonly title = signal('web-ticket');

}