import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ApplyComponent } from './components/apply/apply.component';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { SearchComponent } from './components/search/search.component';
import { ApplicantsComponent } from './components/applicants/applicants.component';
import { UserTrackComponent } from './components/user-track/user-track.component';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full'},
  { path: 'home', component: HomeComponent },
  { path: 'apply', component: ApplyComponent },
  { path: 'login', component: LoginComponent },
  { path: 'search', component: SearchComponent },
  { path: 'applicants', component: ApplicantsComponent },
  { path: 'user-track', component: UserTrackComponent },
  { path: '**', component: PageNotFoundComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(
    routes,
    {
      enableTracing: true
    }
  )],
  exports: [RouterModule]
})
export class AppRoutingModule { }
