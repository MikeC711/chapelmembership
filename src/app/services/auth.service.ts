import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { BehaviorSubject } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  user = new BehaviorSubject<User>(null) ;
  uid: string = 'NotFoundYet' ;
  admins = ['JYGRBoUSTnRXzcbqCuBAQ6CQ0vQ2', // Roger
  'LYyBm3t8pFXGVprpa0RTmd0fSJY2', 'HGkG1mdHn2bWT3AAv1vr4fMSUEm2', // Emily/MikeC
  'uHJoy9UQ7efaSYfDSS8logpaP5g1', 'rOnYPm4s9nONDVAJ41At6Jhrgqh2', // Anita/Robert
  'TfFMqHFmtzU23pY4TCkTxCzCePS2', 'a5wkLK7ErFPEW3BGdQ8AsNvBOCj2'] ; // Tyson/PC
  editors = ['wVmTsm4bzZRhtb5QUnF5wgimLcQ2', // DrCraig
  'c9IRpDp9dAUXghHUqxvma9gwK1w2', 'xcJHkhJKNkfKvbUr8NQteGR12uC2'] ; // DaveS/MikeH

  constructor(private afa: AngularFireAuth) { }

  doLogin(eMail: string, password: string) {
    return new Promise<any>((resolve, reject) => {
      this.afa.auth.signInWithEmailAndPassword(eMail, password).then(res => {
        console.log(res)
        this.uid = res.user.uid ;
        const user = new User(res.user.email, res.user.uid, res.user.refreshToken) ;
        this.user.next(user) ;
        resolve(res) ;
      }, err => {
        console.log(err) ;
        reject(err)
      }) ;
    })
  }

  doCreateWithEmail(eMail: string, password: string) {
    return new Promise<any>((resolve, reject) => {
      this.afa.auth.createUserWithEmailAndPassword(eMail, password).then(res => {
        console.log(res) ;
        this.uid = res.user.uid ;
        const user = new User(res.user.email, res.user.uid, res.user.refreshToken) ;
        this.user.next(user) ;
        resolve(res) ;
      }, err => {
        console.log(err) ;
        reject(err) ;
      })
    })
  }

  doLogout() {
    this.afa.auth.signOut() ;
  }

  isAdmin() {
    for (let curUid of this.admins) {
      if (this.uid === curUid)  return true ;
    }
    return false;
  }
}
