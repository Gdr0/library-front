## Avvio del progetto

Dopo aver clonato la repository, assicurarsi di essere sul branch `develop`.

Poi, dalla cartella del frontend:

```bash
npm i
ng serve
```

Una volta avviata l'applicazione, il frontend sarà disponibile in locale su `http://localhost:4200/`.

## Sezioni principali

L'applicazione è organizzata in tre sezioni principali: clienti, libri e prestiti.

### Clienti

La sezione clienti mostra l'elenco dei clienti registrati nel sistema.

Da questa pagina è possibile:
- visualizzare i clienti presenti
- creare un nuovo cliente
- modificare un cliente già esistente

### Libri

La sezione libri permette di gestire il catalogo della biblioteca.

Da qui è possibile:
- visualizzare i libri presenti
- creare un nuovo libro
- modificare un libro esistente
- aggiornare la quantità di copie disponibili

### Prestiti

La sezione prestiti raccoglie la parte principale della logica applicativa.

Da questa pagina è possibile:
- visualizzare l'elenco dei prestiti
- creare un nuovo prestito
- aprire il dettaglio di un prestito
- registrare la restituzione dei libri

Nel dettaglio del prestito vengono mostrati lo stato del prestito, i libri coinvolti, gli importi già maturati e il totale dovuto dal cliente in quel momento.

Se il prestito è in ritardo, vengono considerate anche le eventuali more. Questi valori non sono letti direttamente dal database come campi statici, ma vengono calcolati dal backend e restituiti tramite API.

Nel form di creazione di un prestito è inoltre possibile associare un cliente già esistente oppure crearne uno nuovo direttamente durante la compilazione.
