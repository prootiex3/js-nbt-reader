import { Bytes } from "./bytes";
import pako from "pako";

export type Optional<T> = T | undefined | null;

export function is_gzip_compressed(bytes: Bytes | Uint8Array) {
	try {
		pako.ungzip(bytes instanceof Bytes ? bytes.as_raw() : bytes);
		return true;
	} catch (err) {
		return false;
	}
}

export function decompress(bytes: Bytes | Uint8Array) {
	return is_gzip_compressed(bytes)
		? Bytes.from(
				pako.ungzip(bytes instanceof Bytes ? bytes.as_raw() : bytes)
		  )
		: bytes;
}
