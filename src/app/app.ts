import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from './ui/sidebar/sidebar.js';
import { HlmSidebarImports } from '@spartan-ng/helm/sidebar';

@Component({
  imports: [RouterOutlet, Sidebar, HlmSidebarImports],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('underground-events');
}
