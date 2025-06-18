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
    this.service.getContact().subscribe({
      next: json => {
        this.contacts = json;
        this.applyFilters();
      }
    });
  }

  onFilterChange(value: string) {
    this.filterText = value.toLowerCase().trim();
    this.applyFilters();
  }

  applyFilters() {
    if (!this.filterText) {
      this.filteredContacts = this.contacts;
      return;
    }

    this.filteredContacts = this.contacts.filter(c =>
      (c.name?.toLowerCase().includes(this.filterText) ?? false) ||
      (c.number?.includes(this.filterText) ?? false) ||
      (c.email?.toLowerCase().includes(this.filterText) ?? false) ||
      (c.category?.toLowerCase().includes(this.filterText) ?? false)
    );
  }

  save() {
    this.service.saveContact(this.formGroupContact.value).subscribe({
      next: json => {
        this.contacts.push(json);
        this.applyFilters();
        this.formGroupContact.reset();
      }
    });
  }

  onClickUpdate(contact: Contact) {
    this.isEditing = true;
    this.formGroupContact.setValue(contact);
  }

  update() {
    this.service.update(this.formGroupContact.value).subscribe({
      next: () => {
        this.loadContact();
        this.clear();
      }
    });
  }

  loadContact() {
    this.service.getContact().subscribe({
      next: json => {
        this.contacts = json;
        this.applyFilters();
      }
    });
  }

  clear() {
    this.isEditing = false;
    this.formGroupContact.reset();
  }

  delete(contact: Contact) {
    this.service.delete(contact).subscribe({
      next: () => this.loadContact()
    });
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
}
