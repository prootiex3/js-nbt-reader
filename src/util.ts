import { Bytes } from "./bytes";

export type Optional<T> = T | undefined | null;

export function arr_compare<T>(self: T[] | Bytes, other: T[] | Bytes) {
	if (self.length != other.length) return false;
	for (let i = 0; i < self.length; ++i) if (self[i] != other[i]) return false;
	return true;
}
