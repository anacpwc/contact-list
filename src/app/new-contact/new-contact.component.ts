import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder} from '@angular/forms';
import { Contact } from '../Contact';
import { ContactService } from '../contact.service';

@Component({
  selector: 'app-new-contact',
  standalone: false,
  templateUrl: './new-contact.component.html',
  styleUrl: './new-contact.component.css'
})
export class NewContactComponent implements OnInit{

  contacts: Contact[] = [];
  formGroupContact: FormGroup;
  isEditing: boolean = false;

  constructor(private service: ContactService, 
  private formBuilder: FormBuilder
  ){
    this.formGroupContact = formBuilder.group({
      id:[''],
      name:[''],
      number:[''],
    });
  }
 
   ngOnInit(): void {
    this.service.getContact().subscribe({
      next: json => this.contacts = json
   });
  }

    save() {
      this.service.saveContact(this.formGroupContact.value).subscribe({
        next: json => {
          this.contacts.push(json);
          this.formGroupContact.reset();
        }
      })
    }

    onClickUpdate(contacts: Contact) {
        this.isEditing = true;
        this.formGroupContact.setValue(contacts);
      }
      
      update() {
        this.service.update(this.formGroupContact.value).subscribe({
          next: () => {
            this.loadContact();
            this.clear();
          }
        })
      }

      loadContact(){
        this.service.getContact().subscribe({
        next: json => this.contacts = json
        });
      }
      
      clear() {
        this.isEditing=false;
        this.formGroupContact.reset();
      }

      delete(contacts: Contact) {
        this.service.delete(contacts).subscribe(
          {
            next: () => this.loadContact()
          })
    }

}
