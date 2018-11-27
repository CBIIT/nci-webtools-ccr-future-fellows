import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  apiRoot = environment.apiRoot;

  constructor(private http: HttpClient) {
  }

  getFields() {
    return this.http.get(`${this.apiRoot}/lookup_tables`);
  }

}
