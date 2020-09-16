import { Component, OnInit, OnDestroy } from '@angular/core';
import { Ministry } from 'src/app/models/ministries.model';
import { Subscription } from 'rxjs';
import { DataaccessService } from 'src/app/services/dataaccess.service';

@Component({
  selector: 'app-ministries',
  templateUrl: './ministries.component.html',
  styleUrls: ['./ministries.component.css']
})
export class MinistriesComponent implements OnInit, OnDestroy {
  ministries: Ministry[] = null ;
  selectedMinistry: Ministry = null ;
  ministrySubscript: Subscription = null ;

  constructor(private dataSvc: DataaccessService) { }

  ngOnInit() {
    this.ministrySubscript = this.dataSvc.ministries.subscribe(qMinistry => {
      console.log('ministries component getting ministries') ;
      this.ministries = qMinistry ;
    })
    if (!this.ministries)  this.ministries = this.dataSvc.getMinistries() ;
  }

  ngOnDestroy() {
    if (this.ministrySubscript) this.ministrySubscript.unsubscribe() ;
  }
}
