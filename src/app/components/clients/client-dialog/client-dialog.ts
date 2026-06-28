import { Component, Inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {
  ClientPayload,
  ClientService,
} from '../../../services/client-service';

@Component({
  selector: 'app-client-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './client-dialog.html',
  styleUrl: './client-dialog.scss',
})
export class ClientDialog implements OnInit {
  clientForm: FormGroup<{
    id: FormControl<number | null>;
    name: FormControl<string>;
    last_name: FormControl<string>;
    phone_number: FormControl<string>;
    email: FormControl<string>;
  }>;

  loading = false;
  saving = false;
  error = '';

  constructor(
    private formBuilder: FormBuilder,
    private clientService: ClientService,
    private dialogRef: MatDialogRef<ClientDialog>,
    @Inject(MAT_DIALOG_DATA) public clientId: number | null,
  ) {
    this.clientForm = this.formBuilder.group({
      id: this.formBuilder.control<number | null>(null),
      name: this.formBuilder.nonNullable.control('',[Validators.required, Validators.maxLength(25)]),
      last_name: this.formBuilder.nonNullable.control('',[Validators.required, Validators.maxLength(25)]),
      phone_number: this.formBuilder.nonNullable.control('',[Validators.required, Validators.maxLength(25)]),
      email: this.formBuilder.nonNullable.control('',[Validators.required, Validators.email, Validators.maxLength(255)]),
    });
  }

  ngOnInit(): void {
    if (this.clientId === null) {
      return;
    }

    this.loading = true;

    this.clientService.getClientById(this.clientId).subscribe({
      next: (response) => {
        this.clientForm.patchValue(response.client);
        this.loading = false;
      },
      error: () => {
        this.error = 'Impossibile caricare il cliente';
        this.loading = false;
      },
    });
  }

  save(): void {
    if (this.clientForm.invalid) {
      this.clientForm.markAllAsTouched();
      return;
    }

    const formValue = this.clientForm.getRawValue();

    const payload: ClientPayload = {
      id: formValue.id ?? undefined,
      name: formValue.name,
      last_name: formValue.last_name,
      phone_number: formValue.phone_number,
      email: formValue.email,
    };

    this.saving = true;
    this.error = '';

    this.clientService.createOrUpdateClient(payload).subscribe({
      next: () => {
        this.dialogRef.close(true);
      },
      error: () => {
        this.error = 'Errore durante il salvataggio del cliente';
        this.saving = false;
      },
    });
  }
}
