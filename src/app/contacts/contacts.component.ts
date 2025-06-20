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
      isFavorite: [false]
    });
  }

  ngOnInit(): void {
    this.loadContacts();
  }

  loadContacts() {
    this.service.getContact().subscribe({
      next: (json) => {
        this.contacts = json;
        this.applyFilters(); 
      }
    });
  }

  onCategoryChange(value: string) {
    this.selectedCategory = value;
    this.applyFilters();
  }

  applyFilters() {
    if (!this.selectedCategory || this.selectedCategory === '') {
      this.filteredContacts = this.contacts;
    } else {
      this.filteredContacts = this.contacts.filter(c => 
        c.category.toLowerCase() === this.selectedCategory.toLowerCase()
      );
    }
  }
}
