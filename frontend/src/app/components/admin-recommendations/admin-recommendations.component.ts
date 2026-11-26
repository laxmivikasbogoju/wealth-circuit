import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NavHeaderComponent } from '../shared/nav-header/nav-header.component';
import { RecommendationService } from '../../services/recommendation.service';
import { UploadResult } from '../../models/recommendation.model';

@Component({
  selector: 'app-admin-recommendations',
  standalone: true,
  imports: [CommonModule, RouterLink, NavHeaderComponent],
  templateUrl: './admin-recommendations.component.html',
  styleUrls: ['./admin-recommendations.component.css']
})
export class AdminRecommendationsComponent {
  selectedFile: File | null = null;
  isUploading = false;
  result: UploadResult | null = null;
  errorMessage = '';

  constructor(private recommendationService: RecommendationService) {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedFile = input.files && input.files.length ? input.files[0] : null;
    this.result = null;
    this.errorMessage = '';
  }

  upload(): void {
    if (!this.selectedFile) {
      return;
    }
    this.isUploading = true;
    this.result = null;
    this.errorMessage = '';

    this.recommendationService.uploadExcel(this.selectedFile).subscribe({
      next: (result) => {
        this.result = result;
        this.isUploading = false;
        this.selectedFile = null;
      },
      error: (err) => {
        this.errorMessage = err?.error?.detail || 'Upload failed. Please check the file and try again.';
        this.isUploading = false;
      }
    });
  }
}
