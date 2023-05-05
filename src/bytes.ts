import { Optional } from "./util";

export class Bytes {
	[key: number]: number;

	// public:
	constructor(...items: number[]) {
		this.#m_data = items;
		this.#m_length = 0;
		for (const byte of items) {
			if (typeof byte != "number")
				throw new Error("Bytes expected type number in iterable.");
			Object.defineProperty(this, this.#m_length++, {
				writable: false,
				configurable: false,
				value: byte,
			});
		}
	}

	get length() {
		return this.#m_length;
	}

	static from(iterable: Iterable<number>) {
		return new Bytes(...iterable);
	}

	static compare(
		a: Bytes | number[] | Uint8Array,
		b: Bytes | number[] | Uint8Array
	) {
		if (a.length != b.length) return false;
		for (let i = 0; i < a.length; ++i) if (a[i] != b[i]) return false;
		return true;
	}

	is_empty() {
		return this.#m_length == 0;
	}

	slice(start: number, end: number = this.#m_length) {
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

	as_integer32() {
		return this.#m_data.reduce(
			(value, current) => value * 256 + current,
			0
		);
	}

	as_integer() {
		// idk if 64 bit integers are needed
		return this.as_integer32();
	}

	as_float(little_endian = false) {
		const buf = Buffer.from(this.#m_data);
		return little_endian ? buf.readFloatLE() : buf.readFloatBE();
	}

	as_double(little_endian = false) {
		const buf = Buffer.from(this.#m_data);
		return little_endian ? buf.readDoubleLE() : buf.readDoubleBE();
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

	get cursor() {
		return this.#m_cursor;
	}

	get bytes() {
		return this.#m_bytes;
	}

	get length() {
		return this.#m_bytes.length;
	}

	peek(): Optional<number> {
		if (this.is_eof()) return null;
		return this.#m_bytes[this.#m_cursor];
	}

	read(amount: number) {
		return this.#m_bytes.slice(this.#m_cursor, (this.#m_cursor += amount));
	}

	consume(): number {
		return this.read(1)[0];
	}

	// private:
	#m_bytes: Bytes;
	#m_cursor: number;
}
