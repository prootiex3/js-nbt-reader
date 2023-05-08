import { ByteReader, Bytes } from "./bytes";
import { decompress } from "./util";

let iota = 0;
const NBT_Type = Object.freeze({
	END: iota++,
	BYTE: iota++,
	SHORT: iota++,
	INT: iota++,
	LONG: iota++,
	FLOAT: iota++,
	DOUBLE: iota++,
	BYTE_ARRAY: iota++,
	STRING: iota++,
	LIST: iota++,
	COMPOUND: iota++,
});

function read_name(reader: ByteReader, should_read_name: boolean) {
	if (!should_read_name) return null;
	const name_length = reader.read(2).as_integer();
	const name = reader.read(name_length).as_string();
	return name;
}

export class NBT_Tag {
	public readonly name: string | null = null;
	public readonly data: any;

	static from_reader(reader: ByteReader, should_read_name: boolean) {}

	to_bytes(): Bytes {
		return new Bytes();
	}
}

export class NBT_End extends NBT_Tag {
	constructor(public readonly name: string | null) {
		super();
	}

	static from_reader(reader: ByteReader, should_read_name: boolean) {}

	to_bytes(): Bytes {
		return new Bytes(NBT_Type.END);
	}
}

export class NBT_Byte extends NBT_Tag {
	constructor(
		public readonly name: string | null,
		public readonly data: number
	) {
		super();
	}

	static from_reader(reader: ByteReader, should_read_name: boolean) {
		const name = read_name(reader, should_read_name);
		const byte = reader.consume();
		return new NBT_Byte(name, byte);
	}

	override to_bytes(): Bytes {
		return new Bytes(NBT_Type.BYTE);
	}
}

export class NBT_Short extends NBT_Tag {
	constructor(
		public readonly name: string | null,
		public readonly data: number
	) {
		super();
	}

	static from_reader(reader: ByteReader, should_read_name: boolean) {
		const name = read_name(reader, should_read_name);
		const value = reader.read(2).as_integer();
		return new NBT_Short(name, value);
	}

	to_bytes(): Bytes {
		return new Bytes(NBT_Type.SHORT);
	}
}

export class NBT_Int extends NBT_Tag {
	constructor(
		public readonly name: string | null,
		public readonly data: number
	) {
		super();
	}

	static from_reader(reader: ByteReader, should_read_name: boolean) {
		const name = read_name(reader, should_read_name);
		const value = reader.read(4).as_integer();
		return new NBT_Int(name, value);
	}

	to_bytes(): Bytes {
		return new Bytes(NBT_Type.INT);
	}
}

export class NBT_Long extends NBT_Tag {
	constructor(
		public readonly name: string | null,
		public readonly data: number
	) {
		super();
	}

	static from_reader(reader: ByteReader, should_read_name: boolean) {
		const name = read_name(reader, should_read_name);
		const value = reader.read(8).as_integer();
		return new NBT_Long(name, value);
	}

	to_bytes(): Bytes {
		return new Bytes(NBT_Type.LONG);
	}
}

export class NBT_Float extends NBT_Tag {
	constructor(
		public readonly name: string | null,
		public readonly data: number
	) {
		super();
	}

	static from_reader(reader: ByteReader, should_read_name: boolean) {
		const name = read_name(reader, should_read_name);
		const value = reader.read(4).as_float();
		return new NBT_Float(name, value);
	}

	to_bytes(): Bytes {
		return new Bytes(NBT_Type.FLOAT);
	}
}

export class NBT_Double extends NBT_Tag {
	constructor(
		public readonly name: string | null,
		public readonly data: number
	) {
		super();
	}

	static from_reader(reader: ByteReader, should_read_name: boolean) {
		const name = read_name(reader, should_read_name);
		const value = reader.read(8).as_double();
		return new NBT_Float(name, value);
	}

	to_bytes(): Bytes {
		return new Bytes(NBT_Type.DOUBLE);
	}
}

export class NBT_Byte_Array extends NBT_Tag {
	constructor(
		public readonly name: string | null,
		public readonly size: number,
		public readonly data: Bytes
	) {
		super();
	}

	static from_reader(reader: ByteReader, should_read_name: boolean) {
		const name = read_name(reader, should_read_name);
		const size = reader.read(4).as_integer();
		const data = reader.read(size);
		return new NBT_Byte_Array(name, size, data);
	}

	to_bytes(): Bytes {
		return new Bytes(NBT_Type.BYTE_ARRAY);
	}
}

export class NBT_String extends NBT_Tag {
	constructor(
		public readonly name: string | null,
		public readonly data: string
	) {
		super();
	}

	static from_reader(reader: ByteReader, should_read_name: boolean) {
		const name = read_name(reader, should_read_name);
		const length = reader.read(2).as_integer();
		const data = reader.read(length).as_string();
		return new NBT_String(name, data);
	}

	to_bytes(): Bytes {
		return new Bytes(NBT_Type.STRING);
	}
}

export class NBT_List extends NBT_Tag {
	constructor(
		public readonly name: string | null,
		public readonly type_id: number,
		public readonly size: number,
		public readonly data: NBT_Tag[]
	) {
		super();
	}

	static from_reader(reader: ByteReader, should_read_name: boolean) {
		const name = read_name(reader, should_read_name);
		const type_id = reader.consume();
		const size = reader.read(4).as_integer();
		const data: NBT_Tag[] = [];
		for (let i = 0; i < size; ++i)
			data.push(read_nbt_tag(reader, false, type_id));
		return new NBT_List(name, type_id, size, data);
	}

	to_bytes(): Bytes {
		return new Bytes(NBT_Type.LIST);
	}
}

export class NBT_Compound extends NBT_Tag {
	constructor(
		public readonly name: string | null,
		public readonly data: NBT_Tag[]
	) {
		super();
	}

	get(name: string): NBT_Tag | null {
		return (
			this.data
				.filter((tag) => !(tag instanceof NBT_End))
				.find((tag: NBT_Tag) => tag.name == name) ?? null
		);
	}

	static from_reader(reader: ByteReader, should_read_name: boolean) {
		const name = read_name(reader, should_read_name);
		const data: NBT_Tag[] = [];
		for (;;) {
			const tag = read_nbt_tag(reader, true);
			if (tag instanceof NBT_End) break;
			data.push(tag);
		}
		return new NBT_Compound(name, data);
	}

	to_bytes(): Bytes {
		return new Bytes(NBT_Type.COMPOUND);
	}
}

function read_nbt_tag(
	reader: ByteReader,
	should_read_name: boolean,
	type_id?: number
): NBT_Tag {
	const type = type_id ?? reader.consume();
	switch (type) {
		case NBT_Type.END:
			return new NBT_End(null);
		case NBT_Type.BYTE:
			return NBT_Byte.from_reader(reader, should_read_name);
		case NBT_Type.SHORT:
			return NBT_Short.from_reader(reader, should_read_name);
		case NBT_Type.INT:
			return NBT_Int.from_reader(reader, should_read_name);
		case NBT_Type.LONG:
			return NBT_Long.from_reader(reader, should_read_name);
		case NBT_Type.FLOAT:
			return NBT_Float.from_reader(reader, should_read_name);
		case NBT_Type.DOUBLE:
			return NBT_Double.from_reader(reader, should_read_name);
		case NBT_Type.BYTE_ARRAY:
			return NBT_Byte_Array.from_reader(reader, should_read_name);
		case NBT_Type.STRING:
			return NBT_String.from_reader(reader, should_read_name);
		case NBT_Type.LIST:
			return NBT_List.from_reader(reader, should_read_name);
		case NBT_Type.COMPOUND:
			return NBT_Compound.from_reader(reader, should_read_name);
		default:
			throw new Error(
				`Unexpected byte ${type} at data index ${reader.cursor}`
			);
	}
}

export function parse_nbt(bytes: Bytes | Uint8Array) {
	const decompressed_bytes = decompress(bytes);
	const reader = (
		decompressed_bytes instanceof Bytes
			? decompressed_bytes
			: Bytes.from(decompressed_bytes)
	).reader();
	const compound = read_nbt_tag(reader, true);
	if (!(compound instanceof NBT_Compound))
		throw new Error(
			"NBT expected to start with compound tag but recieved something else."
		);
	return compound;
}
