import { Component, OnInit, OnDestroy } from '@angular/core';
import { People } from 'src/app/models/people.model';
import { DataaccessService } from 'src/app/services/dataaccess.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-people',
  templateUrl: './people.component.html',
  styleUrls: ['./people.component.css']
})
export class PeopleComponent implements OnInit, OnDestroy {
  people: People[] = null ;
  selectedPerson: People ;
  peopleSubscrip: Subscription = null ;

  constructor(private dataSvc: DataaccessService) { }

  ngOnInit() {
    this.peopleSubscrip = this.dataSvc.people.subscribe(qPeople =>
      this.people = qPeople) ;
      if (this.people != null) {
        console.log('Got people on Subscription, Number of people: ', this.people.length) ;
        console.log(this.people[0]) ;
      }
  }

  onQueryName(name) {
    this.dataSvc.getPeople(name) ;
    console.log('Trying to query people for name: '+name)
  }

  ngOnDestroy() {
    if (this.peopleSubscrip) this.peopleSubscrip.unsubscribe() ;
  }

}
