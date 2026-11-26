import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ThemeToggleComponent } from '../shared/theme-toggle/theme-toggle.component';

interface Faq {
  question: string;
  answer: string;
  open: boolean;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, ThemeToggleComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  faqs: Faq[] = [
    {
      question: 'Do I need trading experience to join?',
      answer: 'No. Our courses are structured for beginners as well as experienced traders looking to sharpen their edge.',
      open: false
    },
    {
      question: 'What do I get with a Wealth Circuit account?',
      answer: 'Real-time market data, curated news, portfolio tracking tools, and access to our course library.',
      open: false
    },
    {
      question: 'Can I cancel a course or subscription anytime?',
      answer: 'Yes, you can manage or cancel your subscription at any time from your account settings.',
      open: false
    },
    {
      question: 'How do I get in touch with support?',
      answer: 'Reach us through the Contact Us section below or email our support team directly.',
      open: false
    }
  ];

  toggleFaq(faq: Faq): void {
    faq.open = !faq.open;
  }
}
