# Chapelmembership
This is the core documentation for the Application written for Membership Augmentation at Chapel By the Sea
in Emerald Isle, NC.  It is meant to provide better info and possibly eventually lead to the pictorial directory.

chapelmembership uses google firebase/firestore as the database as the volumes are low enough that we stay in the free range.  This means that environments/environment.ts and environment.prod.ts contain the info to connect to the data base.  Currently there are administrative userids and non-administrative userids.  I (Mike Casile) am looking for a way to integrate the uid keys into the data so that families can access their own info.  Ideally, I would like for folks who sign in with a "family" userid to see a small subset of what is available (ie: can only update their own family).  May be able to see other families as well.

I am sure that this is in git, and I need to refresh my memory on how to make all of that work ... ideally, eventually from here in VS Code.  I'd also like to 
Git ssh: git@github.com:MikeC711/chapelmembership.git
Git https: https://github.com/MikeC711/chapelmembership.git

# Angular setup
`npm install -g @angular/cli`
`ng new modelApp`
`sudo apt install ng-common`

# old MD info
This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 8.3.8.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
