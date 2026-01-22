import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SearchUserService {
  private baseUrl = 'https://echolink-backend.onrender.com/people';

  constructor(private http: HttpClient) {}

  searchUser(searchedUsername: string) {
    return this.http.get<any>(`${this.baseUrl}/search`, {
      params: {
        query: searchedUsername,
      },
    });
  }
}
