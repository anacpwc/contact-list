import { Component, OnInit } from '@angular/core'; 
import { Contact } from '../Contact';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ContactService } from '../contact.service';

@Component({
  selector: 'app-contacts',
  standalone: false,
  templateUrl: './contacts.component.html',
  styleUrl: './contacts.component.css'
})
export class ContactsComponent implements OnInit {

  contacts: Contact[] = [];
  filteredContacts: Contact[] = []; 
  formGroupContact: FormGroup;
  isEditing: boolean = false;

  selectedCategory: string = ''; 

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
    this.loadContacts();
  }

  loadContacts() {
    this.service.getContact().subscribe({
      next: (json) => {
        console.log('Contatos carregados:', json); 
        this.contacts = this.sortedCopyByName(json);
        this.filteredContacts = [...this.contacts]; 
      },
      error: (err) => {
        console.error('Erro ao carregar contatos:', err);
      }
    });
  }

  onCategoryChange(value: string) {
    this.selectedCategory = value;
    this.applyFilters();
  }

  applyFilters() {
    if (!this.selectedCategory || this.selectedCategory === '') {
      this.filteredContacts = [...this.contacts]; 
    } else {
      this.filteredContacts = this.contacts.filter(c => 
        c.category?.toLowerCase().trim() === this.selectedCategory.toLowerCase().trim()
      );
    }

    this.filteredContacts = this.sortedCopyByName(this.filteredContacts); 
  }

  private sortedCopyByName(list: Contact[]): Contact[] {
    return [...list].sort((a, b) => {
      const nameA = (a.name ?? '').trim().toLowerCase();
      const nameB = (b.name ?? '').trim().toLowerCase();
      if (nameA > nameB) return 1;
      if (nameA < nameB) return -1;
      return 0;
    });
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

  formatDateBR(dateString: string): string {
    if (!dateString || dateString.trim() === '') return 'Não informado';
    const [year, month, day] = dateString.split('-');
    if (!year || !month || !day) return dateString;
    return `${day}/${month}/${year}`;
  }
}
