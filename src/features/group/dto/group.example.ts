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

export const aGroup = {
  _id: '11112222333344445555abcd',
  owner: anUser._id ,
  title: 'Programming',
  isPublic: true,
}

export const secondGroup = {
  _id: '44445555abcd111122223333',
  owner: anUser._id,
  title: 'Programming 2',
  isPublic: true,
}

export const groupProfile = {
  members: [
    {_id: anUser._id, username: anUser.username}, 
    {_id: secondUser._id, username: secondUser.username}, 
    {_id: thirdUser._id, username: thirdUser.username}
  ],
}