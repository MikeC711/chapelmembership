import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { map, take } from 'rxjs/operators';

@Injectable({providedIn: 'root'})
export class AuthGuard implements CanActivate {
    constructor(private authSvc: AuthService) {}

    canActivate(route: ActivatedRouteSnapshot, router: RouterStateSnapshot) :
        boolean | Promise<boolean> | Observable<boolean> {
        return this.authSvc.user.pipe(take(1),map(user => {
            return !!user ;
        }))
    }
}