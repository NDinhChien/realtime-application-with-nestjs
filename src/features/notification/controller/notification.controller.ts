import { Controller } from "@nestjs/common";
import { NotificationService } from "../service/notification.service";
/*

GET notification/before?id=&before=
GET notification/after?id=&after=

*/
@Controller('notification')
export class NotificationController {
  constructor(
    private notificationService: NotificationService
  ) {}

  async getForUserBefore() {
    
  }
  
  async getForUserAfter() {
    
  }
}