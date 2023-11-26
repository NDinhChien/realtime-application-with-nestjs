import { aGroup, secondGroup } from "../../../group/dto/group.example"

export const anUser = {
  _id: 'aaabbbcccdddeeefffggghhh',
  username: 'helloworld',
  online: false,
}

export const secondUser = {
  _id: 'eeefffggghhhaaabbbcccddd',
  username: 'user2',
  online: true,
}

export const thirdUser = {
  _id: '000999abcdefabcdef88887777',
  username: 'user3',
  online: true,
}

export const fourthUser = {
  _id: 'abcdefabcdef88887777000999',
  username: 'user4',
  online: true,
}

export const fifthUser = {
  _id: '000999abcdefabcdef88887777',
  username: 'user5',
  online: true,
}

export const aProfile = {
  email: 'test@email.com',
  groups: [
    {_id: aGroup._id, owner: anUser._id,}, 
    {_id: secondGroup._id, owner: secondUser._id,}
  ],
  friends: [
    {_id: secondUser._id, username: secondUser.username}, 
    {_id: thirdUser._id, username: thirdUser.username}, 
    {_id: fourthUser._id, username: fourthUser.username}, 
  ],
}