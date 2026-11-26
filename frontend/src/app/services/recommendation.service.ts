import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environment/environment';
import { RecommendationListResponse, UploadResult } from '../models/recommendation.model';

@Injectable({
  providedIn: 'root'
})
export class RecommendationService {
  private apiUrl = `${environment.apiUrl}/recommendations`;

  constructor(private http: HttpClient) {}

  getRecommendations(): Observable<RecommendationListResponse> {
    return this.http.get<RecommendationListResponse>(this.apiUrl);
  }

  uploadExcel(file: File): Observable<UploadResult> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<UploadResult>(`${this.apiUrl}/upload`, formData);
  }
}
