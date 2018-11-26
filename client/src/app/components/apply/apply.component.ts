import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { DataService } from 'src/app/services/data/data.service';
import { FormGroup, FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-apply',
  templateUrl: './apply.component.html',
  styleUrls: ['./apply.component.scss']
})
export class ApplyComponent implements OnInit {

  fields$: Observable<any>;
  form: FormGroup;

  constructor(
    private dataService: DataService,
    private formBuilder: FormBuilder
  ) { }

  ngOnInit() {
    this.form = this.formBuilder.group({

    })
    this.fields$ = this.dataService.getFields();
    this.fields$.subscribe(e => console.log(e));
  }

}
