import { Component, inject, OnInit, signal } from '@angular/core';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { Client, ClientService } from '../../services/client-service';

@Component({
  selector: 'app-clients',
  imports: [
    MatTableModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './clients.html',
  styleUrl: './clients.scss',
})
export class Clients implements OnInit {
  private clientService = inject(ClientService);

  clients = signal<Client[]>([]);
  totalClients = signal(0);
  currentPage = signal(1);
  pageSize = signal(10);
  loading = signal(false);
  error = signal('');

  displayedColumns = [
    'name',
    'lastName',
    'phoneNumber',
    'email',
  ];

  ngOnInit(): void {
    this.loadClients();
  }

  loadClients(page: number = 1): void {
    this.loading.set(true);
    this.error.set('');

    this.clientService.getClients(page).subscribe({
      next: (response) => {
        this.clients.set(response.clients.data);
        this.totalClients.set(response.clients.total);
        this.currentPage.set(response.clients.current_page);
        this.pageSize.set(response.clients.per_page);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Impossibile caricare i clienti');
        this.loading.set(false);
      },
    });
  }

  changePage(event: PageEvent): void {
    this.loadClients(event.pageIndex + 1);
  }
}
