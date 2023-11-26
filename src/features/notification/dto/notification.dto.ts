import { Transform, Type } from "class-transformer";
import { IsDate, IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";
import { ObjectId,  } from "../../../shared/mongoose/object-id";
export const aNotification = {
  _id: '',
  to: '',
  message: ''
}
export class GetNotificationBeforeQuery {
  

  @IsNotEmpty()
  @Transform(({value}) => new ObjectId(value))
  id: ObjectId;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  before?: Date;
}

export class GetNotificationRes {

}
export class GetNotificationAfterQuery {

  @IsNotEmpty()
  @Transform(({value}) => new ObjectId(value))
  id: ObjectId;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  after?: Date;
}


export class CreateNotificationBody {
  

  @IsNotEmpty()
  @Transform(({value}) => new ObjectId(value))
  id: ObjectId;

  @MaxLength(2000)
  @IsString()
  message: string;

}