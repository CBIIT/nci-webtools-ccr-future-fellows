import { Injectable } from '@angular/core';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor() { }

  getFields() {
    return of({
      job_categories: [
        {value: 1, label: 'Postdoctoral Fellowship'},
        {value: 2, label: 'Postdoctoral Fellowship (Foreign Visiting Fellow)'},
      ],
      scientific_focus_areas: [
        {value: 1, label: 'Biomedical Engineering / Biophysics / Physics'},
        {value: 2, label: 'Cancer Biology'},
        {value: 3, label: 'Chemistry / Chemical Biology'},
        {value: 4, label: 'Chromosome Biology/Epigenetics'},
        {value: 5, label: 'Clinical Research'},
        {value: 6, label: 'Computational Biology / Bioinformatics / Biostatistics / Mathematics'},
        {value: 7, label: 'Developmental Biology'},
        {value: 8, label: 'Epidemiology / Population Sciences'},
        {value: 9, label: 'Genetics/Genomics'},
        {value: 10, label: 'Health Disparities'},
        {value: 11, label: 'Immunology'},
        {value: 12, label: 'Microbiology / Infectious diseases (non-viral)'},
        {value: 13, label: 'Molecular Biology / Biochemistry'},
        {value: 14, label: 'Molecular Pharmacology / Toxicology'},
        {value: 15, label: 'Neuroscience/Neurophysiology / Neurodevelopment'},
        {value: 16, label: 'Social and Behavioral Sciences'},
        {value: 17, label: 'Stem Cells / Induced Pluripotent Stem Cells'},
        {value: 18, label: 'Structural Biology'},
      ],
      states: [{"value":"AL","label":"AL"},{"value":"AK","label":"AK"},{"value":"AS","label":"AS"},{"value":"AZ","label":"AZ"},{"value":"AR","label":"AR"},{"value":"CA","label":"CA"},{"value":"CO","label":"CO"},{"value":"CT","label":"CT"},{"value":"DE","label":"DE"},{"value":"DC","label":"DC"},{"value":"FM","label":"FM"},{"value":"FL","label":"FL"},{"value":"GA","label":"GA"},{"value":"GU","label":"GU"},{"value":"HI","label":"HI"},{"value":"ID","label":"ID"},{"value":"IL","label":"IL"},{"value":"IN","label":"IN"},{"value":"IA","label":"IA"},{"value":"KS","label":"KS"},{"value":"KY","label":"KY"},{"value":"LA","label":"LA"},{"value":"ME","label":"ME"},{"value":"MH","label":"MH"},{"value":"MD","label":"MD"},{"value":"MA","label":"MA"},{"value":"MI","label":"MI"},{"value":"MN","label":"MN"},{"value":"MS","label":"MS"},{"value":"MO","label":"MO"},{"value":"MT","label":"MT"},{"value":"NE","label":"NE"},{"value":"NV","label":"NV"},{"value":"NH","label":"NH"},{"value":"NJ","label":"NJ"},{"value":"NM","label":"NM"},{"value":"NY","label":"NY"},{"value":"NC","label":"NC"},{"value":"ND","label":"ND"},{"value":"MP","label":"MP"},{"value":"OH","label":"OH"},{"value":"OK","label":"OK"},{"value":"OR","label":"OR"},{"value":"PW","label":"PW"},{"value":"PA","label":"PA"},{"value":"PR","label":"PR"},{"value":"RI","label":"RI"},{"value":"SC","label":"SC"},{"value":"SD","label":"SD"},{"value":"TN","label":"TN"},{"value":"TX","label":"TX"},{"value":"UT","label":"UT"},{"value":"VT","label":"VT"},{"value":"VI","label":"VI"},{"value":"VA","label":"VA"},{"value":"WA","label":"WA"},{"value":"WV","label":"WV"},{"value":"WI","label":"WI"},{"value":"WY","label":"WY"}],
      citizenship: [
        {value: 1, label: 'Canadian'},
        {value: 2, label: 'F-1 Visa'},
        {value: 3, label: 'Foreign National'},
        {value: 4, label: 'H-1 Visa'},
        {value: 5, label: 'J-1 Visa'},
        {value: 6, label: 'U.S. Permanent Resident'},
        {value: 7, label: 'United States'},
      ],
      education_levels: [{"value":1,"label":"DDS"},{"value":2,"label":"DO"},{"value":3,"label":"DSc"},{"value":4,"label":"DVM"},{"value":5,"label":"JD"},{"value":6,"label":"MD"},{"value":7,"label":"MPH"},{"value":8,"label":"PhD"},{"value":9,"label":"PharmD"},{"value":10,"label":"Sc.D."}],
    });
  }
}
