import { Component, OnInit, OnDestroy } from '@angular/core';
import { MarketService } from '../../services/market.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-dashboard',
  standalone: true,
 imports: [CommonModule, FormsModule],   
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {

  symbol: string = 'NIFTY';
  quote: any;
  liveData: any;

  private socket!: WebSocket;

  constructor(private marketService: MarketService) {}

  ngOnInit(): void {
    this.connectWebSocket();
  }

  getQuote() {
    this.marketService.getQuote(this.symbol)
      .then(data => {
        this.quote = data;
      })
      .catch(() => {
        alert('Failed to fetch quote');
      });
  }

  connectWebSocket() {
    this.socket = this.marketService.connectWS();

    this.socket.onmessage = (event) => {
      this.liveData = JSON.parse(event.data);
    };

    this.socket.onerror = () => {
      console.error('WebSocket error');
    };
  }

  ngOnDestroy(): void {
    if (this.socket) {
      this.socket.close();
    }
  }
}
