import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Contact } from '../Contact';
import { ContactService } from '../contact.service';

@Component({
  selector: 'app-new-contact',
  standalone: false,
  templateUrl: './new-contact.component.html',
  styleUrl: './new-contact.component.css'
})
export class NewContactComponent implements OnInit {

  contacts: Contact[] = [];
  filteredContacts: Contact[] = [];
  formGroupContact: FormGroup;
  isEditing = false;
  filterText = '';
  searchText = '';
  numeroDuplicado = false;
  emailDuplicado = false;
  campoVazio = false;

  constructor(private service: ContactService, private formBuilder: FormBuilder) {
    this.formGroupContact = formBuilder.group({
      id: [''],
      name: [''],
      number: [''],
      email: [''],
      category: [''],
      isFavorite: [false],
      city: [''],
      occupation: [''],
      birthDate: [''],
      emergency: [false]
    });
  }

  ngOnInit(): void {
    this.loadContact();
    this.setupNumberFormatting();
  }

  setupNumberFormatting() {
    this.formGroupContact.get('number')?.valueChanges.subscribe(value => {
      if (!value) return;
      let cleaned = value.replace(/\D/g, '');
      if (cleaned.length > 11) cleaned = cleaned.substring(0, 11);
      let formatted = '';
      if (cleaned.length > 6) {
        formatted = cleaned.replace(/^(\d{2})(\d{5})(\d{0,4}).*/, '($1) $2-$3');
      } else if (cleaned.length > 2) {
        formatted = cleaned.replace(/^(\d{2})(\d{0,5}).*/, '($1) $2');
      } else if (cleaned.length > 0) {
        formatted = cleaned.replace(/^(\d{0,2}).*/, '($1');
      }
      if (formatted !== value) {
        this.formGroupContact.get('number')?.setValue(formatted, { emitEvent: false });
      }
    });
  }

  loadContact() {
    this.service.getContact().subscribe({
      next: json => {
        this.contacts = json;
        this.sortContactsByName(this.contacts);
        this.applyFilters();
      }
    });
  }

  save(event: Event): void {
    event.preventDefault();
    if (!this.formGroupContact.value.name.trim() || !this.formGroupContact.value.number.trim() || !this.formGroupContact.value.email.trim() || !this.formGroupContact.value.category.trim()) {
      this.campoVazio = true;
      return;
    } else {
      this.campoVazio = false;
    }
    const novoContato = { ...this.formGroupContact.value };
    novoContato.number = this.cleanNumber(novoContato.number);
    const numeroInput = (novoContato.number ?? '').trim();
    const emailInput = (novoContato.email ?? '').trim().toLowerCase();
    this.numeroDuplicado = numeroInput !== '' && this.contacts.some(c => c.number === numeroInput);
    this.emailDuplicado = emailInput !== '' && this.contacts.some(c => (c.email ?? '').toLowerCase() === emailInput);
    if (this.numeroDuplicado || this.emailDuplicado) return;
    this.service.saveContact(novoContato).subscribe({
      next: json => {
        this.contacts.push(json);
        this.sortContactsByName(this.contacts);
        this.applyFilters();
        this.formGroupContact.reset();
        this.numeroDuplicado = false;
        this.emailDuplicado = false;
        this.campoVazio = false;
      }
    });
  }

  update(event: Event): void {
    event.preventDefault();
    if (!this.formGroupContact.value.name.trim() || !this.formGroupContact.value.number.trim() || !this.formGroupContact.value.email.trim() || !this.formGroupContact.value.category.trim()) {
      this.campoVazio = true;
      return;
    } else {
      this.campoVazio = false;
    }
    const contatoEditado = { ...this.formGroupContact.value };
    contatoEditado.number = this.cleanNumber(contatoEditado.number);
    const numeroInput = (contatoEditado.number ?? '').trim();
    const emailInput = (contatoEditado.email ?? '').trim().toLowerCase();
    this.numeroDuplicado = numeroInput !== '' && this.contacts.some(c => c.number === numeroInput && c.id !== contatoEditado.id);
    this.emailDuplicado = emailInput !== '' && this.contacts.some(c => (c.email ?? '').toLowerCase() === emailInput && c.id !== contatoEditado.id);
    if (this.numeroDuplicado || this.emailDuplicado) return;
    this.service.update(contatoEditado).subscribe({
      next: () => {
        this.loadContact();
        this.clear();
        this.numeroDuplicado = false;
        this.emailDuplicado = false;
        this.campoVazio = false;
      }
    });
  }

  onClickUpdate(contact: Contact) {
    this.isEditing = true;
    this.numeroDuplicado = false;
    this.emailDuplicado = false;
    const formattedNumber = this.formatPhone(contact.number ?? '');
    this.formGroupContact.setValue({ ...contact, number: formattedNumber });
  }

  clear() {
    this.isEditing = false;
    this.numeroDuplicado = false;
    this.emailDuplicado = false;
    this.campoVazio = false;
    this.formGroupContact.reset();
  }

  delete(contact: Contact) {
    this.service.delete(contact).subscribe({
      next: () => this.loadContact()
    });
  }

  onFilterChange(value: string) {
    this.filterText = value.toLowerCase().trim();
    this.applyFilters();
  }

  onSearchClick() {
    this.filterText = this.searchText.toLowerCase().trim();
    this.applyFilters();
  }

  clearFilter() {
    this.searchText = '';
    this.filterText = '';
    this.applyFilters();
  }

  applyFilters() {
    if (!this.filterText) {
      this.filteredContacts = [...this.contacts];
    } else {
      this.filteredContacts = this.contacts.filter(c =>
        (c.name?.toLowerCase().includes(this.filterText) ?? false) ||
        (c.number?.includes(this.filterText) ?? false) ||
        (c.email?.toLowerCase().includes(this.filterText) ?? false) ||
        (c.category?.toLowerCase().includes(this.filterText) ?? false) ||
        (c.city?.toLowerCase().includes(this.filterText) ?? false) ||
        (c.occupation?.toLowerCase().includes(this.filterText) ?? false) ||
        (c.birthDate?.includes(this.filterText) ?? false)
      );
    }
    this.sortContactsByName(this.filteredContacts);
  }

  private cleanNumber(value: string): string {
    return value ? value.replace(/\D/g, '') : '';
  }

  formatPhone(value: string): string {
    if (!value) return '';
    let cleaned = value.replace(/\D/g, '');
    if (cleaned.length > 11) cleaned = cleaned.substring(0, 11);
    if (cleaned.length > 6) {
      return cleaned.replace(/^(\d{2})(\d{5})(\d{0,4}).*/, '($1) $2-$3');
    } else if (cleaned.length > 2) {
      return cleaned.replace(/^(\d{2})(\d{0,5}).*/, '($1) $2');
    } else if (cleaned.length > 0) {
      return cleaned.replace(/^(\d{0,2}).*/, '($1');
    }
    return value;
  }

  private sortContactsByName(list: Contact[]) {
    list.sort((a, b) => {
      if (!a.name) return 1;
      if (!b.name) return -1;
      return a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' });
    });
  }

  formatDateBR(dateString: string): string {
  if (!dateString || dateString.trim() === '') return 'Não informado';
  const [year, month, day] = dateString.split('-');
  if (!year || !month || !day) return dateString;
  return `${day}/${month}/${year}`;
}


}
