import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Contact } from './Contact';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ContactService {

  apiUrl = "http://localhost:8080/contacts";

  constructor(private http: HttpClient) { }

  getContact() : Observable<Contact[]>{
    return this.http.get<Contact[]>(this.apiUrl);
  }

  saveContact(contacts: Contact): Observable<Contact>{
    return this.http.post<Contact>(this.apiUrl, contacts);
  }

  update(contacts: Contact): Observable<Contact>{
    return this.http.put<Contact>(`${this.apiUrl}/${contacts.id}`, contacts);
  }

  delete(contacts: Contact): Observable<void>{
    return this.http.delete<void>(`${this.apiUrl}/${contacts.id}`);
  }

  getContactsByCategory(category: string): Observable<Contact[]> {
    return this.http.get<Contact[]>(`${this.apiUrl}/search?category=${category}`);
  }
}