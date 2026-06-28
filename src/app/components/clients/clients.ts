import { Component, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { Client, ClientService } from '../../services/client-service';
import { ClientDialog } from './client-dialog/client-dialog';

@Component({
  selector: 'app-clients',
  imports: [
    MatTableModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatDialogModule,
  ],
  templateUrl: './clients.html',
  styleUrl: './clients.scss',
})
export class Clients implements OnInit {
  constructor(
    private clientService: ClientService,
    private dialog: MatDialog,
  ) {}

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

  createClient(): void {
    this.openDialog(null);
  }

  editClient(client: Client): void {
    this.openDialog(client.id);
  }

  private openDialog(clientId: number | null): void {
    const dialogRef = this.dialog.open(ClientDialog, {
      width: '500px',
      data: clientId,
    });

    dialogRef.afterClosed().subscribe((saved) => {
      if (saved) {
        this.loadClients(this.currentPage());
      }
    });
  }
}
