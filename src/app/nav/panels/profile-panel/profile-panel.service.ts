import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ProfilePanelService {
  constructor(private http: HttpClient) {}

  getFriends() {
    return this.http.get(`http://localhost:8080/people/getFriends`);
  }
}
