import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavHeaderComponent } from '../shared/nav-header/nav-header.component';

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [CommonModule, NavHeaderComponent],
  templateUrl: './blog.component.html',
  styleUrls: ['./blog.component.css']
})
export class BlogComponent {}
