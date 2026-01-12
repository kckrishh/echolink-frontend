import { Component, OnInit } from '@angular/core';
import { ProfilePanelService } from '../profile-panel.service';

@Component({
  selector: 'app-people',
  templateUrl: './people.component.html',
  styleUrl: './people.component.css',
})
export class PeopleComponent implements OnInit {
  friends: any[] = [];
  currTab = 'friends';

  constructor(private profilePanelService: ProfilePanelService) {}
  ngOnInit(): void {
    this.getFriends();
  }

  getFriends() {
    this.profilePanelService.getFriends().subscribe((next: any) => {
      this.friends = next;
    });
  }
}
