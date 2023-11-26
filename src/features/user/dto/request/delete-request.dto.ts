import { ApiProperty } from "@nestjs/swagger";
import { HttpApiResponse } from "../../../../shared/core/CoreApiResponse";

export class DeleteRequestRes extends HttpApiResponse {

  @ApiProperty({example: 'request delete success'})
  public message: string;

}

export class DeleteAllRequestRes extends HttpApiResponse {

  @ApiProperty({example: 'requests delete success'})
  public message: string;

}