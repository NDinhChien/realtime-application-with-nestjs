import { HttpApiResponse } from '../../../shared/core/CoreApiResponse';
import { ApiProperty } from '@nestjs/swagger';

export class SubscribeGroupRes extends HttpApiResponse {
  @ApiProperty({example: 'group request sent'})
  public message: string;

  @ApiProperty({
    example: {
      direction: 'Please wait for group owner decision.',
    }
  })
  public data: any;

}

export class UnsubscribeGroupRes extends HttpApiResponse {

  @ApiProperty({example: 'group unsubscribe success'})
  public message: string;

}

export class JoinPublicGroupRes extends HttpApiResponse {
  
  @ApiProperty({example: 'public group join success'})
  public message: string;

}