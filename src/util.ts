import { Bytes } from "./bytes";
import pako from "pako";

export type Optional<T> = T | undefined | null;

export function is_gzip_compressed(bytes: Bytes) {
	try {
		pako.ungzip(bytes.as_raw());
		return true;
	} catch (err) {
		return false;
	}
}

export function decompress(bytes: Bytes): Bytes {
	return is_gzip_compressed(bytes)
		? Bytes.from(pako.ungzip(bytes.as_raw()))
		: bytes;
}
