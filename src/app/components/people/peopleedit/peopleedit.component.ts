import { Component, OnInit, ViewChild } from '@angular/core';
import { DataaccessService } from 'src/app/services/dataaccess.service';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { People } from 'src/app/models/people.model';
import { NgForm } from '@angular/forms';
import { Ministry } from 'src/app/models/ministries.model';

@Component({
  selector: 'app-peopleedit',
  templateUrl: './peopleedit.component.html',
  styleUrls: ['./peopleedit.component.css']
})
export class PeopleeditComponent implements OnInit {
  // @ViewChild('personForm', {static: false}) personForm: NgForm ; 
  editMode: boolean = false ;
  personId: string ;
  ministryList: Ministry[] ;    // Full list of ministries
  availableMinistries: string[] ;   // List of ministries person is NOT currently in
  person: People = null ;
  dataSaved = false ;
  memStatRadio = [ {Val: 'ME', Disp: 'Member'}, {Val: 'AM', Disp: 'Associate Member'},
    {Val: 'RA', Disp: 'Regular Attender'}, {Val: 'AT', Disp: 'Attends'},
    {Val: 'RE', Disp: 'Relocated'}, {Val: 'VI', Disp: 'Visitor'}] ;
  contactRadio = [ {Val: 'T', Disp: 'Text'}, {Val: 'P', Disp: 'Phone'},
    {Val: 'E', Disp: 'eMail'}, {Val: 'M', Disp: 'Mail'} ] ;

  constructor(private dataSvc: DataaccessService, private route: ActivatedRoute,
    private router: Router) { }

  ngOnInit() {
    if (!this.editMode) {
      this.person = this.dataSvc.createNewPerson() ;
    }
    this.route.params.subscribe(
      (params: Params) => {
      this.personId = params['id'] ;
      this.editMode = params['id'] != null ;
      console.log('Person ID: '+this.personId, ' Edit Mode: ', this.editMode) ;
      if (this.editMode) {
        let curVal = this.dataSvc.getPerson(this.personId) ;
        console.log(curVal, curVal instanceof People, curVal instanceof Promise) ;
        if (curVal instanceof Promise) {
          curVal.then(newPerson => {
            this.person = newPerson ;
          })
        } else this.person = curVal ;
      }
    })

    this.ministryList = this.dataSvc.getMinistries() ;
    this.loadAvailMinistries() ;
    if (this.editMode) this.removeExistingMinistries() ;
    console.log('mlLen: ', this.ministryList.length, ' availLen: ', this.availableMinistries.length) ;
  }

  onAddPerson() {
    this.dataSaved = true ;
    if (!this.editMode) {
      this.editMode = true ;    // Record saved, now can edit (or add within family)
      console.log('Assuming would add, new editmode: ', this.editMode) ;
      console.log(this.person)
      this.dataSvc.addPerson(this.person) ;   // May want while dup type logic here and/or seq.key logic
    } else {
      if (this.person.id == undefined || this.person.id == '') {
        this.person.id = this.dataSvc.addedPersonId ;
      }
      console.log('Assuming would update') ;
      console.log(this.person) ;
      this.dataSvc.updatePerson(this.person) ;
    }
  }

  private loadAvailMinistries() {
    this.availableMinistries = [] ;
    for (const ministry of this.ministryList)
      this.availableMinistries.push(ministry.id) ;
  }

  private removeExistingMinistries() {
    for (let idx = 0; idx < this.availableMinistries.length; idx++) {
      for (const ministry of this.person.ministries) {
        if (ministry === this.availableMinistries[idx]) {
          this.availableMinistries.splice(idx, 1) ;
          break ;
        }
      }
    }
  }

  onDeletePerson() {
    console.log('Called onDeletePerson') ;
    this.dataSvc.deletePerson(this.person) ;
    this.router.navigate(['/members'])
  }

  onDeleteMinistry(ministry: string) {
    console.log('onDel: persLen: ', this.person.ministries.length, ' availLen: ', this.availableMinistries.length) ;
    this.moveMinistry(ministry, this.person.ministries, this.availableMinistries) ;
    console.log('aftDel: persLen: ', this.person.ministries.length, ' availLen: ', this.availableMinistries.length) ;
  }

  onAddMinistry(ministry) {
    let curVal = ministry.value ;
    console.log('onAdd: minVal: ', curVal, ' minpersLen: ', this.person.ministries.length, ' availLen: ', this.availableMinistries.length) ;
    this.moveMinistry(curVal, this.availableMinistries, this.person.ministries) ;
    console.log('aftAdd: persLen: ', this.person.ministries.length, ' availLen: ', this.availableMinistries.length) ;
  }

  private moveMinistry(ministry: string, donorArray: string[], receiveArray: string[]) {
    receiveArray.push(ministry) ;
    for (let idx = 0; idx < donorArray.length; idx++) {
      if (donorArray[idx] === ministry) {
        donorArray.splice(idx, 1) ;
        break ;
      }
    }
  }

  onAddWithinFamily() {
    console.log('Would modify to add w/in family') ;
    this.person.firstName = '' ; this.person.eMail = '' ; this.person.birthDate = new Date() ;
    this.person.ministries = [] ;
    this.editMode = false ;
    this.loadAvailMinistries() ;
    this.dataSaved = false ;
  }
}
