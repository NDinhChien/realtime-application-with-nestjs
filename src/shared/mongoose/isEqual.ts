import { ObjectId } from "./object-id";

export function isEqual(a: ObjectId, b: ObjectId) {
  return a.equals(b);
}
