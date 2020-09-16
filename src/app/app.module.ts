import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule} from '@angular/forms' ;

import { AngularFireModule } from '@angular/fire';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { RouterModule, Routes } from '@angular/router' ;
import { environment } from 'src/environments/environment';

import { AppComponent } from './app.component';
import { PeopleComponent } from './components/people/people.component';
import { PeopleeditComponent } from './components/people/peopleedit/peopleedit.component';
import { HeaderComponent } from './components/header/header.component';
import { AuthComponent } from './components/auth/auth.component';
import { MinistriesComponent } from './components/ministries/ministries.component';
import { MinistryEditComponent } from './components/ministries/ministry-edit/ministry-edit.component';
import { QueriesComponent } from './components/queries/queries.component';
import { AuthGuard } from './services/auth.guard';

const appRoutes: Routes = [
  { path: '', redirectTo: 'members', pathMatch: 'full' },
  // { path: 'queries', component: QueriesComponent, canActivate: [AuthGuard] },
  { path: 'queries', component: QueriesComponent, canActivate: [AuthGuard] },
  { path: 'auth', component: AuthComponent },
  { path: 'ministries', component: MinistriesComponent, canActivate: [AuthGuard], children: [
    { path: 'new', component: MinistryEditComponent},
    { path: ':id', component: MinistryEditComponent}
  ] },
  { path: 'members', component: PeopleComponent, canActivate: [AuthGuard], children: [
    { path: 'new', component: PeopleeditComponent},
    { path: ':id', component: PeopleeditComponent}
  ] }
]

@NgModule({
  declarations: [
    AppComponent,
    PeopleComponent,
    PeopleeditComponent,
    HeaderComponent,
    AuthComponent,
    MinistriesComponent,
    MinistryEditComponent,
    QueriesComponent,
  ],
  imports: [
    BrowserModule, AngularFireModule.initializeApp(environment.firebase),
    AngularFireAuthModule, AngularFirestoreModule,
    FormsModule, RouterModule.forRoot(appRoutes)
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
