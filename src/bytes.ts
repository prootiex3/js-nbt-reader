import { Optional } from "./util";

export class Bytes {
	[key: number]: number;

	// public:
	constructor(...items: number[]) {
		this.#m_data = [];
		this.#m_length = 0;
		for (const byte of items) {
			if (typeof byte != "number")
				throw new Error("Bytes expected type number in iterable.");
			this.#m_data.push(byte);
			Object.defineProperty(this, this.#m_length++, {
				writable: false,
				configurable: false,
				value: byte,
			});
		}
	}

	static from(iterable: Iterable<number>) {
		return new Bytes(...iterable);
	}

	get length() {
		return this.#m_length;
	}

	is_empty() {
		return this.#m_length == 0;
	}

	slice(start: number = 0, end: number = this.#m_length) {
		if (
			end > this.#m_length ||
			start > this.#m_length ||
			start < 0 ||
			end <= 0
		)
			throw new Error(
				`Slice(${start}:${end}) is indexing out of bounds. Bytes length is ${
					this.#m_length
				}, whilst trying to access index ${end > start ? end : start}.`
			);
		const bytes: number[] = [];
		for (let i = start; i < end; ++i) bytes.push(this[i]);
		return Bytes.from(bytes);
	}

	at(index: number) {
		if (index < 0 || index > this.#m_length || typeof index != "number")
			throw new Error(`Index ${index} is out of bounds.`);
		return this[index];
	}

	as_string() {
		return String.fromCharCode(...this);
	}

	as_int32(little_endian: boolean) {
		const buf = Buffer.from(this.#m_data.slice(-4));
		return little_endian ? buf.readInt32LE() : buf.readInt32BE();
	}

	as_number(little_endian = false) {
		return this.as_int32(little_endian);
	}

	as_hex() {
		return this.#m_data
			.map((byte) => (byte & 0xff).toString(16))
			.join("")
			.toUpperCase();
	}

	as_raw() {
		return new Uint8Array(this);
	}

	reader() {
		return new ByteReader(this);
	}

	// Symbols
	*[Symbol.iterator](): Generator<number> {
		for (let i = 0; i < this.#m_length; ++i) yield this[i];
	}

	// private:
	#m_data: number[];
	#m_length: number;
}

export class ByteReader {
	// public:
	constructor(bytes: Bytes) {
		this.#m_bytes = bytes;
		this.#m_cursor = 0;
	}

	is_eof() {
		return this.#m_cursor >= this.#m_bytes.length;
	}

	get length() {
		return this.#m_bytes.length;
	}

	read(amount: number): Optional<Bytes> {
		try {
			return this.#m_bytes.slice(
				this.#m_cursor,
				(this.#m_cursor += amount)
			);
		} catch (err) {
			return null;
		}
	}

	consume(): Optional<number> {
		const byte = this.read(1);
		return byte == null ? null : byte[0];
	}

	// private:
	#m_bytes: Bytes;
	#m_cursor: number;
}
