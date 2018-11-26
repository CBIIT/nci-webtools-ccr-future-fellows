import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { HomeComponent } from './components/home/home.component';
import { ApplyComponent } from './components/apply/apply.component';
import { LoginComponent } from './components/login/login.component';
import { UserTrackComponent } from './components/user-track/user-track.component';
import { SearchComponent } from './components/search/search.component';
import { ApplicantsComponent } from './components/applicants/applicants.component';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { DataService } from './services/data/data.service';
import { StoreService } from './services/store/store.service';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    HomeComponent,
    ApplyComponent,
    LoginComponent,
    UserTrackComponent,
    SearchComponent,
    ApplicantsComponent,
    PageNotFoundComponent
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    AppRoutingModule,
  ],
  providers: [
    DataService,
    StoreService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
