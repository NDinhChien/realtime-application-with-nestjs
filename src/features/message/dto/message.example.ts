import { anUser, secondUser } from "../../user/dto/user/user.example"

export const aMessage = {
  _id: 'aaabbb12345cccddd12345',
  from: anUser._id,
  message: 'hello',
  to: secondUser._id,
  createdAt: '11/16/2023, 9:31:36 AM',
  updatedAt: '11/16/2023, 9:31:36 AM',
}

export const anotherMessage = {
  _id: 'cccdddaaabbb1234512345',
  from: secondUser._id,
  message: 'world',
  to: anUser._id,
  createdAt: '11/16/2023, 9:32:36 AM',
  updatedAt: '11/16/2023, 9:32:36 AM',
}