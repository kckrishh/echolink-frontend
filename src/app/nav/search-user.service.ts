import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SearchUserService {
  private baseUrl = 'http://localhost:8080/people';

  constructor(private http: HttpClient) {}

  searchUser(searchedUsername: string) {
    return this.http.get<any>(`${this.baseUrl}/search`, {
      params: {
        query: searchedUsername,
      },
    });
  }
}
