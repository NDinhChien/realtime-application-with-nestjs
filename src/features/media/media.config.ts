import { MediaType } from "./schema/media.schema";
import { User } from "../user/schema/user.schema";
const path = require('path');
const fs = require('fs');

export const storagePath = path.resolve('storage');

const avatar_ext = 'png';
export const AvatarConfig = {
  fieldName: 'avatar',
  ext: avatar_ext,
  maxSize: 6 * Math.pow(1024, 2),
  path: path.join(storagePath, MediaType.AVATAR),
  getName: (user: User) => {
    return `${user._id}.${avatar_ext}`;
  }, 
}

export const fileExts = [
'txt', 'mjs', 'js', 'csv','css', 'html','htm', 'xml',
'pdf', 'json','gz', 'docx','doc', 'bin','7z', 'zip', 'xlsx','xls', 'pptx', 'ppt'
];

export const avatarExts = [
  'png', 'jpeg', 'jpg'
]

export function createStorageFolder() {
  if (!fs.existsSync(storagePath)) {
    fs.mkdirSync(storagePath);
    for (const subdir of Object.values(MediaType)) {
      fs.mkdirSync(path.join(storagePath, subdir))
    }
  }
}

