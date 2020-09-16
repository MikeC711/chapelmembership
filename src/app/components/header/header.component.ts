import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  isAuthenticated = false ;
  navbarOpen = false ;
  authSubscription: Subscription ;
  // collapsed = true ;

  constructor(private authSvc: AuthService) { }

  ngOnInit() {
    this.authSubscription =  this.authSvc.user.subscribe(user => {
      console.log(user) ;
      this.isAuthenticated = !!user ;
    }) ;
  }

  onLogout() {
    console.log('Called onLogout') ;
  }

  onSaveData() {
    console.log('Called onSaveData') ;
  }

  onFetchData() {
    console.log('Called onFetchData') ;
  }

  ngOnDestroy() {
    if (this.authSubscription)  this.authSubscription.unsubscribe() ;
  }

}
