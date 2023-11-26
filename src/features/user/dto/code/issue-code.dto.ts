import { IsEnum, IsString } from "class-validator";
import { CodeType } from "../../schema/code.schema";
import { ApiParamOptions, ApiProperty } from "@nestjs/swagger";
import { HttpApiResponse } from "../../../../shared/core/CoreApiResponse";

export const CodeTypeParam: ApiParamOptions = {
  name: 'type',
  required: true,
  type: String,
  enum: CodeType,
}

export class ACodeType {

  @IsEnum(CodeType)
  type: CodeType;

}

export class IssueCodeRes extends HttpApiResponse {

  @ApiProperty({example: 'code issue success'})
  public message: string;

  @ApiProperty({example: {
    direction: 'Please check your email to proceed',
  }})
  public data: any;
}
