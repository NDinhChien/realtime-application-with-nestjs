import { ApiProperty } from "@nestjs/swagger";
import { HttpApiResponse } from "../../../../shared/core/CoreApiResponse";

export class UploadAvatarBody {

  @ApiProperty({ type: 'string', format: 'binary' })
  avatar: Express.Multer.File;

} 

export class UploadAvatarRes extends HttpApiResponse {

  @ApiProperty({example: 'avatar upload success'})
  public message: string;

}