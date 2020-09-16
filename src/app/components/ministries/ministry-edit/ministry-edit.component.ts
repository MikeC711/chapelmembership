import { Component, OnInit, ViewChild } from '@angular/core';
import { DataaccessService } from 'src/app/services/dataaccess.service';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { NgForm } from '@angular/forms';
import { Ministry } from 'src/app/models/ministries.model';
import { People } from 'src/app/models/people.model';

@Component({
  selector: 'app-ministry-edit',
  templateUrl: './ministry-edit.component.html',
  styleUrls: ['./ministry-edit.component.css']
})
export class MinistryEditComponent implements OnInit {
  @ViewChild('ministryForm', {static: false}) ministryForm: NgForm ; 
  editMode: boolean = false ;
  ministryId: string ;
  ministry: Ministry = null ;
  dataSaved = false ;
  showMembers = false ;
  minPeopsArray: People[] ;     // People currently in this ministry
  joinPeopsArray: People[] ;    // People selected for possibly joining

  constructor(private dataSvc: DataaccessService, private route: ActivatedRoute,
    private router: Router) { }

  ngOnInit() {
    if (!this.editMode) {
      this.ministry = this.dataSvc.createNewMinistry() ;
    }
    this.route.params.subscribe(
      (params: Params) => {
      this.ministryId = params['id'] ;
      this.editMode = params['id'] != null ;
      console.log('Ministry ID: '+this.ministryId, ' Edit Mode: ', this.editMode) ;
      if (this.editMode) {
        this.ministry = this.dataSvc.getMinistry(this.ministryId) ;
      } else {
        this.ministry = this.dataSvc.createNewMinistry() ;
      }
    
      this.minPeopsArray = [] ;
      this.joinPeopsArray = [] ;
      this.showMembers = false ;
   })

    this.dataSvc.minPeops.subscribe(qPeops => {
      console.log('Setting minPeopsArr w/len: ', qPeops.length) ;
      this.minPeopsArray = qPeops
    })

    this.dataSvc.people.subscribe(mPeops => {
      this.joinPeopsArray = mPeops ;
      if (this.minPeopsArray) {       // If we know people already in, remove them from potential list
        for (let idx = 0; idx < this.joinPeopsArray.length; idx++) {
          for (let mPeop of this.minPeopsArray) {
            if (mPeop.id === this.joinPeopsArray[idx].id) {
              this.joinPeopsArray.splice(idx, 1) ;
            }
          }
        }
      }
    })
  }
  
  onAddMinistry() {
    if (!this.editMode) {
      this.editMode = true ;    // Record saved, now can edit (or add within family)
      this.dataSvc.addMinistry(this.ministry) ;   // May want while dup type logic here and/or seq.key logic
      this.router.navigate(['/ministries', this.ministry.id]) ;
    } else {
      this.dataSvc.updateMinistry(this.ministry) ;
    }
  }

  onDeleteMinistry() {
    this.dataSvc.deleteMinistry(this.ministry) ;
    this.router.navigate(['/ministries'])
  }

  onShowMembers() {
    if (this.showMembers)  this.minPeopsArray = [] ;       // Were showing, this turns it off
    this.showMembers = !this.showMembers ;
    this.dataSvc.ministry$.next(this.ministry.id) ;   // Request records for this ID
  }

  onRemovePersonFromMinistry(person: People) {
    this.dataSvc.removePersonFromMinistry(person, this.ministry) ;
  }

  onAddPersonToMinistry(person: People) {
    this.dataSvc.addMinistryForPerson(person, this.ministry) ;
  }

  onSearchPeople(name) {
    console.log("In onSearchPeople with name: ", name.value) ;
    this.dataSvc.name$.next(name.value) ;
  }
}
