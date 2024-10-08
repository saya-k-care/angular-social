import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';
import { catchError, Observable, throwError } from 'rxjs';
import { User } from '../models/user';
import { GlobalConstants } from 'src/environments/GlobalConstants';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private token = this.keycloakService.getKeycloakInstance().token;
  private baseUrl = GlobalConstants.spring_boot_auth_url + "/api/app/";
  public keycloakUser: User;
  public userIsOnAdminModule: boolean = false;

  constructor(private http: HttpClient, private keycloakService: KeycloakService) { }

  public login(): Observable<any> {
    let user = new User();
    let payload = this.obtainPayload(this.token);
    this.createUserWithPayload(payload, user);

    console.log("print test starts-->")
    try{
      this.http.get<any>(GlobalConstants.spring_boot_auth_url + '/api/foos/1').subscribe(data => {
        console.log("printing helloooo" + data)
    })  
    }
    catch(e) {
      console.log("print test error-->" + e)
    }
     

    const httpHeaders = new HttpHeaders({'Content-Type': 'application/json', 'Authorization': 'Basic ' + this.keycloakService.getToken()});
    return this.http.post<any>(this.baseUrl + "login", user, {headers: httpHeaders}).pipe(
      catchError(
        e => throwError(() => new Error(e) )
    
    )
    );
  }

  public getUsername(): string {
    let payload = this.obtainPayload(this.token);
    return payload.preferred_username;
  }

  public hasRole(role: string): boolean {
    let payload = this.obtainPayload(this.token);
    return payload.resource_access.springback.roles.includes(role);
  }

  public userIsChecked() {
    return this.keycloakUser.isChecked;
  }

  private obtainPayload(access_token:string): any {
    return JSON.parse(window.atob(access_token.split(".")[1]));
  }

  private createUserWithPayload(payload, user: User) {
    user.username = payload.preferred_username;
    user.name = payload.given_name;
    user.surname = payload.family_name;
  }
}