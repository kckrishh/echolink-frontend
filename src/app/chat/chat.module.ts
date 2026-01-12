import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ChatRoutingModule } from './chat-routing.module';
import { ChatComponent } from './chat.component';
import { SidebarLeftComponent } from './sidebar-left/sidebar-left.component';
import { ChatMainComponent } from './chat-main/chat-main.component';
import { SidebarRightComponent } from './sidebar-right/sidebar-right.component';
import { GroupsComponent } from './sidebar-left/groups/groups.component';
import { DmComponent } from './sidebar-left/dm/dm.component';

import {
  User,
  LucideAngularModule,
  Search,
  MoreHorizontal,
} from 'lucide-angular';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    ChatComponent,
    SidebarLeftComponent,
    ChatMainComponent,
    SidebarRightComponent,
    GroupsComponent,
    DmComponent,
  ],
  imports: [
    CommonModule,
    ChatRoutingModule,
    HttpClientModule,
    FormsModule,
    LucideAngularModule.pick({ User, Search, MoreHorizontal }),
  ],
})
export class ChatModule {}
