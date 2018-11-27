import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { DataService } from 'src/app/services/data/data.service';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';

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
    private fb: FormBuilder
  ) { }

  ngOnInit() {
    this.fields$ = this.dataService.getFields();
    this.form = this.fb.group({
      job_category: [1, Validators.required],
      scientific_focus: this.fb.group({}),
      first_name: [null, Validators.required],
      middle_initial: [null],
      last_name: [null, Validators.required],
      email: [null, Validators.required],
      address_1: [null, Validators.required],
      address_2: [null],
      city: [null, Validators.required],
      state: [null],
      zip: [null],
      home_phone: [null, Validators.required],
      work_phone: [null],
      fax_phone: [null],
      citizenship: [null, Validators.required],
      undergraduate_gpa: [null],
      education_level: this.fb.group({}),
      research_interests: [null],
      postdoc_experience: [null],
      referral_source: [null],
      availability_date: [null],
      resume: [null],
      is_foreign: [false],
    });

    // treat checkbox groups as {string: boolean} objects
    this.fields$.subscribe(fields => {
      for (let key of ['scientific_focus', 'education_level']) {
        const group = <FormGroup> this.form.get(key);
        for (let {id} of fields[key])
          group.addControl(id, new FormControl(false));
      }
    });

    this.form.valueChanges.subscribe(v => console.log(v));
  }

}
