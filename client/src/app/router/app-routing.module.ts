import { NgModule } from '@angular/core';
import { Routes, RouterModule, RouteReuseStrategy } from '@angular/router';
import { ComponentReuseStrategy } from './ComponentReuseStrategy';
import { ApplyComponent } from '../components/apply/apply.component';
import { HomeComponent } from '../components/home/home.component';
import { LoginComponent } from '../components/login/login.component';
import { SearchComponent } from '../components/search/search.component';
import { ApplicantsComponent } from '../components/applicants/applicants.component';
import { UserTrackComponent } from '../components/user-track/user-track.component';
import { PageNotFoundComponent } from '../components/page-not-found/page-not-found.component';
import { environment } from '../../environments/environment';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full'},
  { path: 'home', component: HomeComponent },
  { path: 'apply', component: ApplyComponent },
  { path: 'login', component: LoginComponent },
  { path: 'search', component: SearchComponent },
  { path: 'applicants', component: ApplicantsComponent },
  { path: 'user-track', component: UserTrackComponent },
  { path: '**', redirectTo: 'home' },
];

@NgModule({
  imports: [RouterModule.forRoot(
    routes,
    {
      enableTracing: !environment.production,
      useHash: true
    }
  )],
  providers: [
    {provide: RouteReuseStrategy, useClass: ComponentReuseStrategy}
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
