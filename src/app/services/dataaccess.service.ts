import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, 
  AngularFirestoreDocument } from '@angular/fire/firestore';
import { AngularFireAuthModule } from '@angular/fire/auth' ;
import { map, take, switchMap } from 'rxjs/operators'
import { Observable, Subject, combineLatest, BehaviorSubject } from 'rxjs';
import { People } from '../models/people.model';
import { Ministry } from '../models/ministries.model';
import { AuthService } from './auth.service';

// TODO: Call authSvc to see if ID is admin. If not, remove not visible from lists.
@Injectable({
  providedIn: 'root'
})
export class DataaccessService {
  peopleCollection: AngularFirestoreCollection<People> ;
  people: Observable<People[]> ;
  minPeops: Observable<People[]> ;    // For people w/in a ministry
  minPeops2: Observable<any> ;    // For people w/in a ministry
  personDoc: AngularFirestoreDocument<People> ;

  ministryCollection: AngularFirestoreCollection<Ministry> ;
  ministries: Observable<any[]> ;
  ministryDoc: AngularFirestoreDocument<Ministry> ;

  name$: Subject<string> ;
  ministry$: Subject<string> ;
  peopleArr: People[] ;
  minPeopsArr: People[] ;
  ministryArr: Ministry[] ;
  addedPersonId: string ;
  isAdmin: boolean = false ;

  constructor(private afs: AngularFirestore, private authSvc: AuthService) {
    this.peopleCollection = afs.collection('eicpeople') ; // Todo try to use this later
    this.ministryCollection = afs.collection('eicministries') ;
    this.name$ = new Subject<string>() ;            // Enable dynamic query
    this.ministry$ = new Subject<string>() ;
    
    // Query for people based on last name or based on ministry name
    this.isAdmin = authSvc.isAdmin() ;
    this.people = this.name$.pipe(switchMap(name =>   
      afs.collection('eicpeople', ref => ref.where('lastName', '==', name)).snapshotChanges().pipe(
        map(changes => {        // This is to store the doc ID into the people structure
          return changes.map(curChg => {
            const data = curChg.payload.doc.data() as People ;
            data.id = curChg.payload.doc.id ;
            // if (data.visibility === true || this.isAdmin) return data ;
            return data ;
          })
        })
      ) 
    )) ;
          // Subscription to people query so people accessible here
    this.people.subscribe(qPeople => {
      console.log('In DataSvc queried and got this many people: ', qPeople.length) ;
      this.peopleArr = qPeople ;
    }) ;
          // Query for ministries
    this.ministries = afs.collection('eicministries').snapshotChanges().pipe(
      map(changes => {
      return changes.map(curChg => {
          const data = curChg.payload.doc.data() as Ministry ;
          data.id = curChg.payload.doc.id ;
          console.log('Query for ministries has record') ;
          return data ;
        })
      })
    ) ;
          // Subscription to ministry query to maintain that array
    this.ministries.subscribe(qMinistry => {
      console.log('In DataSvc queried and got this many ministries: ', qMinistry.length) ;
      this.ministryArr = qMinistry ;
    }) ;

    // This should be a switchmap with other people query, but separate for now
    this.minPeops = this.ministry$.pipe(switchMap(ministry =>
      afs.collection('eicpeople', ref => ref.where('ministries', 'array-contains', ministry)).
        snapshotChanges().pipe(map(changes => {
          return changes.map(curChg => {
            const data = curChg.payload.doc.data() as People ;
            data.id = curChg.payload.doc.id ;
            // if (data.visibility === true || this.isAdmin) return data ;
            return data ;
          })
        })
      )
    )) ;

    this.minPeops.subscribe(qPeops => {
      console.log('Ran Peops for Ministry and got len: ', qPeops.length)
      this.minPeopsArr = qPeops ;
    })
  
    }

   /*********************************************************************************************
    * Retrieve the person record from the held array based on ID (save a trip to server)
    *  If array is empty, then get the record by ID
    *********************************************************************************************/
   getPerson(id: string) : People | Promise<People> {
     console.log('dataSvc getting person for id: '+id) ;
     if (!this.peopleArr || this.peopleArr.length == 0)  return this.getPersonById(id) ;
     for (let idx = 0; idx < this.peopleArr.length; idx++) {
       if (this.peopleArr[idx].id === id)  return  this.peopleArr[idx] ;
     }
     return null ;
   }

   /*********************************************************************************************
    * Retrieve ministries array
    *********************************************************************************************/
   getMinistries() {
     return this.ministryArr ;
   }

   /*********************************************************************************************
    * Retrieve the ministry record from the held array based on ID (save a trip to server)
    *  If array is empty, then return null
    *********************************************************************************************/
   getMinistry(id: string) : Ministry {
    console.log('dataSvc getting ministry for id/name: '+id) ;
    if (!this.ministryArr || this.ministryArr.length == 0)  return null ;
    for (let idx = 0; idx < this.ministryArr.length; idx++) {
      if (this.ministryArr[idx].id === id)  return  this.ministryArr[idx] ;
    }
    return null ;
  }

   /*********************************************************************************************
    * For adds and such, create a person object with blank or default values
    *********************************************************************************************/
   createNewPerson() {
    const blankAddr = { streetAddr: '', city: '', state: '', zipCode: '' } ;
    return new People('', '', '', 'ME', true, '', blankAddr, 'T', new Date(), '',
    []) ;
   }

   /*********************************************************************************************
    * For adds and such, create a ministry object with blank or default values
    *********************************************************************************************/
   createNewMinistry() {
    return new Ministry('', '', '' ) ;
   }

   /*********************************************************************************************
    * Retrieve a person from the DB/collection based on ID
    *********************************************************************************************/
   private getPersonById(id: string) : Promise<People> {
      let personPromise: Promise<People> ;
      personPromise = this.afs.doc(`eicpeople/${id}`).ref.get().then(doc => {
      if (doc.exists) {
        console.log('Got doc on personById')
        const data = doc.data() as People ;
        let person = data ;
        person.id = id ;
        return (person.visibility == true || this.isAdmin) ? person : null ;
        // return person ;
      } else return null ;
    })
    return personPromise ;
   }

   /*********************************************************************************************
    * Invoke new or refreshed query for this lastName
    *********************************************************************************************/
   getPeople(lName) {
     this.name$.next(lName) ;
   }

   /*********************************************************************************************
    * If familyKey blank (new person in new family)
    *   Generate familyKey based on lastname+random
    *     Should never hit a dup in reality, but gotta handle it
    * Else (familyKey sent in, so this is adding a person to a family)
    *   Verify that family exists
    * Call function to add person
    * Some issues with async and sync, so dups (which should be absurdly rare) just failing and
    *  will try to put in layer to handle retries.
    *********************************************************************************************/
   addPerson(person: People) {
    let famRequired = true ;          // Add within family
    if (person.familyKey == '')  {     // New family for this one
        person.familyKey = this.getFamiyKey(person.lastName) ;
        famRequired = false ;
    }

    this.afs.collection('eicpeople', ref => ref.where('familyKey', '==', person.familyKey))
      .valueChanges().pipe(take(1)).subscribe(matchingRecs => {
        if (matchingRecs.length > 0 && famRequired) {    // FamilyKey already good and needed here
          this.addPersonToFamily(person) ;
        } else {
          if (matchingRecs.length < 1 && !famRequired) {  // No recs for fam which is good here
            this.addPersonToFamily(person) ;
          } else {
            console.log((famRequired) ? 'No family key: '+person.familyKey+' to add person to family' :
              'Family key: '+person.familyKey+' Already exists') ;
          }
        }
      })
   }

   /*****************************************************************************************
    * Add a new ministry to the ministry collection
    ****************************************************************************************/
   addMinistry(ministry: Ministry) {  // Consider making ministry name the ID. Then all good
     this.ministryCollection.doc(ministry.id).ref.set( { description: ministry.description,
        mission: ministry.mission } ) ;
    }

  /*********************************************************************************************
   * Remove a person/member from collection via ID
   *********************************************************************************************/
   deletePerson(person: People) {
    console.log(person) ;
    this.personDoc = this.afs.doc(`eicpeople/${person.id}`) ;
    this.personDoc.delete() ;
   }

  /*********************************************************************************************
   * Remove a ministry from collection via ID
   *********************************************************************************************/
  deleteMinistry(ministry: Ministry) {
    this.ministryDoc = this.afs.doc(`eicministries/${ministry.id}`) ;
    this.ministryDoc.delete() ;
   }

  /*********************************************************************************************
   * Update a person record by ID
   *********************************************************************************************/
  updatePerson(person: People) { 
    console.log('Called updatePerson w/ID: '+person.id) ;
    this.personDoc = this.afs.doc(`eicpeople/${person.id}`) ;
    console.log('About to update person: ') ;
    console.log(person) ;
    this.personDoc.set( { ...person } ) ;
   }

  /*********************************************************************************************
   * Update a ministry record by ID
   *********************************************************************************************/
  updateMinistry(ministry: Ministry) { 
    this.ministryDoc = this.afs.doc(`eicministries/${ministry.id}`) ;
    this.ministryDoc.set( { ...ministry } ) ;
   }

   /********************************************************************************************
    * Generate a family key based on last name (6 chars) followed by a seqNum between 1000 and 9999.
    * Yes, nameVal could be saved, but this should never be hit more than once 99.9% of the time
    ********************************************************************************************/
   private getFamiyKey(lName): string {
    let nameVal = (lName.length > 6) ? lName.substring(0,6) : (lName.length < 6) ?
      lName.padEnd(6, 'x') : lName ;
    let seqVal = Math.floor(Math.random() * 8999) + 1000 ;
    let famKey = nameVal + seqVal.toString() ;
    console.log('FamKey for name: '+lName+' is: '+famKey) ;
    return  famKey ;
   }

   /********************************************************************************************
    * Family work all done, now just need to generate person key and add person to table
    *  If personKey exists (rare), then generate new seqNo and try again
    *  Else Add person
    ********************************************************************************************/
   private addPersonToFamily(person: People) {
    let dup = true ;
    let seqVal = Math.floor(Math.random() * 8999) + 1000 ;
    this.addedPersonId = person.familyKey + seqVal.toString() ;
    console.log('Adding person: '+this.addedPersonId+' to family: '+person.familyKey) ;
    this.peopleCollection.doc(this.addedPersonId).ref.get().then(doc => {
      if (doc.exists) {
        console.log('Dup on person ID: '+this.addedPersonId) ;
      } else {
        delete person.id ;
        console.log('Trying to add person w/id: '+this.addedPersonId) ;
        console.log(person) ;
        this.peopleCollection.doc(this.addedPersonId).ref.set( { ...person}) ;
      }
    })
   }

   removePersonFromMinistry(person: People, ministry: Ministry) {
     for (let idx = 0; idx < person.ministries.length; idx++) {
      if (person.ministries[idx] === ministry.id) {
        person.ministries.splice(idx, 1) ;
        this.updatePerson(person) ;
        break ;
      }
     }
   }

   addMinistryForPerson(person: People, ministry: Ministry) {
     person.ministries.push(ministry.id) ;
     this.updatePerson(person) ;
   }
}
