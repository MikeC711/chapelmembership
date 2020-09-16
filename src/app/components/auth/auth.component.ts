import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent implements OnInit {
  errorMsg: string ;
  successMsg: string ;

  constructor(private authSvc: AuthService) { }

  ngOnInit() {
  }

  onSubmit(loginForm: NgForm) {
    if (!loginForm.valid) { return ; }   // If form hacked, don't allow it here
    const eMail = loginForm.value.email ;
    const password = loginForm.value.password ;
    this.authSvc.doLogin(eMail, password).then(res => {
      console.log(res) ;
      this.errorMsg = '' ;
      this.successMsg = 'You are now logged in' ;
    }, err => {
      console.log(err) ;
      this.errorMsg = err.message ;
      this.successMsg = '' ;
    })
  }
}
