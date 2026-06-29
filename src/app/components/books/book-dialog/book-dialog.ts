import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthorService } from '../../../services/author-service';
import {
  Author,
  BookPayload,
  BookService,
  Editor,
} from '../../../services/book-service';
import { EditorService } from '../../../services/editor-service';
import { ConfirmationDialog } from '../../../shared/confirmation-dialog/confirmation-dialog';

@Component({
  selector: 'app-book-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './book-dialog.html',
  styleUrl: './book-dialog.scss',
})
export class BookDialog implements OnInit {
  bookForm: FormGroup<{
    id: FormControl<number | null>;
    editor_id: FormControl<number>;
    editorSearch: FormControl<string | Editor>;
    title: FormControl<string>;
    isbn: FormControl<string>;
    synopsis: FormControl<string>;
    daily_price: FormControl<number>;
    total_quantity: FormControl<number>;
    authorSearch: FormControl<string>;
    authors: FormArray<FormControl<number>>;
  }>;

  loading = false;
  saving = false;
  error = '';
  selectedAuthors: Author[] = [];
  authorOptions: Author[] = [];
  editorOptions: Editor[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private bookService: BookService,
    private authorService: AuthorService,
    private editorService: EditorService,
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<BookDialog>,
    @Inject(MAT_DIALOG_DATA) public bookId: number | null,
  ) {
    this.bookForm = this.formBuilder.group({
      id: this.formBuilder.control<number | null>(null),
      editor_id: this.formBuilder.nonNullable.control(0,[Validators.required, Validators.min(1)],),
      editorSearch: this.formBuilder.nonNullable.control<string | Editor>('',Validators.required,),
      title: this.formBuilder.nonNullable.control('', Validators.required),
      isbn: this.formBuilder.nonNullable.control('', Validators.required),
      synopsis: this.formBuilder.nonNullable.control('', Validators.required),
      daily_price: this.formBuilder.nonNullable.control(0.5,[Validators.required, Validators.min(0)],),
      total_quantity: this.formBuilder.nonNullable.control(0,[Validators.required, Validators.min(0)],),
      authorSearch: this.formBuilder.nonNullable.control(''),
      authors: this.formBuilder.array<FormControl<number>>([],Validators.required,),
    });
  }

  get authors(): FormArray<FormControl<number>> {
    return this.bookForm.controls.authors;
  }

  ngOnInit(): void {
    if (this.bookId === null) {
      return;
    }

    this.loading = true;

    // chiama il dettaglio libro
    this.bookService.getBookById(this.bookId).subscribe({
      next: (response) => {
        const book = response.book;

        this.bookForm.patchValue({
          id: book.id,
          editor_id: book.editor_id,
          editorSearch: book.editor,
          title: book.title,
          isbn: book.isbn,
          synopsis: book.synopsis,
          daily_price: book.daily_price,
          total_quantity: book.total_quantity,
        });

        // salviamo gli autori selezionati []
        this.selectedAuthors = book.authors;

        // li pushiamo nel formarray
        book.authors.forEach((author) => {
          this.authors.push(
            this.formBuilder.nonNullable.control(author.id),
          );
        });

        this.loading = false;
      },
      error: () => {
        this.error = 'Impossibile caricare il libro';
        this.loading = false;
      },
    });
  }

  save(): void {
    if (this.bookForm.invalid) {
      this.bookForm.markAllAsTouched();
      return;
    }

    this.dialog.open(ConfirmationDialog, {
      width: '420px',
      data: {
        title: this.bookId ? 'Confermare modifica libro?' : 'Confermare nuovo libro?',
        confirmLabel: 'Salva',
      },
    }).afterClosed().subscribe((confirmed) => {
      if (!confirmed) {
        return;
      }

      const formValue = this.bookForm.getRawValue();

      const payload: BookPayload = {
        id: formValue.id ?? undefined,
        editor_id: formValue.editor_id,
        title: formValue.title,
        isbn: formValue.isbn,
        synopsis: formValue.synopsis,
        daily_price: formValue.daily_price,
        total_quantity: formValue.total_quantity,
        authors: formValue.authors,
      };

      this.saving = true;
      this.error = '';

      this.bookService.createOrUpdateBooks(payload).subscribe({
        next: () => {
          this.dialogRef.close(true);
        },
        error: (error: HttpErrorResponse) => {
          this.error = error.error.errors.isbn?.[0]
            ?? error.error.errors.authors?.[0]
            ?? error.error.errors.editor_id?.[0]
            ?? error.error.errors.title?.[0];
          this.saving = false;
        },
      });
    });
  }

  searchAuthors(event?: Event): void {
    // se scrivo qualcosa valorizza search altrimenti ''
    const search = event ? (event.target as HTMLInputElement).value : '';

    this.authorService.getAuthors(search).subscribe({
      next: (response) => {
        this.authorOptions = response.authors.filter(
          (author) => !this.selectedAuthors.some(
            (selected) => selected.id === author.id,
          ),
        );
      },
    });
  }

  selectAuthor(event: MatAutocompleteSelectedEvent): void {
    const author = event.option.value as Author;

    // salviamo autore selezionato
    this.selectedAuthors.push(author);
    // pushiamo nel formarrai id
    this.authors.push(
      this.formBuilder.nonNullable.control(author.id),
    );

    // azzeriamo la ricerca così possiamo ricominciare a scrivere
    this.bookForm.controls.authorSearch.setValue('');
    this.authorOptions = [];
  }

  removeAuthor(author: Author): void {
    const index = this.selectedAuthors.findIndex(
      (selected) => selected.id === author.id,
    );
    if (index === -1) {return;}
    // rimuove dall'aray per il chip
    this.selectedAuthors.splice(index, 1);
    // rimuove dal formarray
    this.authors.removeAt(index);
  }
  
  // funziona come per gli autori ma senza formarry
  searchEditors(event?: Event): void {
    if (event) {
      this.bookForm.controls.editor_id.setValue(0);
    }

    const search = event? (event.target as HTMLInputElement).value : '';

    this.editorService.getEditors(search).subscribe({
      next: (response) => {
        this.editorOptions = response.editors;
      },
    });
  }

  selectEditor(event: MatAutocompleteSelectedEvent): void {
    const editor = event.option.value as Editor;

    this.bookForm.patchValue({
      editor_id: editor.id,
      editorSearch: editor,
    });
  }

  displayAuthor(author: Author | string): string {
    if (typeof author === 'string') {
      return author;
    }

    return author ? `${author.name} ${author.last_name}` : '';
  }

  displayEditor(editor: Editor | string): string {
    if (typeof editor === 'string') {
      return editor;
    }

    return editor ? editor.name : '';
  }
}
