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
	const name_length = reader.read(2)?.as_integer();
	const name = reader.read(name_length!)?.as_string()!;
	return name;
}

class NBT_Tag {
	static from_reader(reader: ByteReader, should_read_name: boolean) {}
	to_bytes(): Bytes {
		return new Bytes();
	}
}

class NBT_End extends NBT_Tag {
	constructor(public readonly name: string | null) {
		super();
	}

	static from_reader(reader: ByteReader, should_read_name: boolean) {}

	to_bytes(): Bytes {
		return new Bytes();
	}
}

class NBT_Byte extends NBT_Tag {
	constructor(
		public readonly name: string | null,
		public readonly byte: number
	) {
		super();
	}

	static from_reader(reader: ByteReader, should_read_name: boolean) {
		const name = read_name(reader, should_read_name);
		const byte = reader.consume();
		return new NBT_Byte(name, byte!);
	}

	override to_bytes(): Bytes {
		return new Bytes();
	}
}

class NBT_Short extends NBT_Tag {
	constructor(
		public readonly name: string | null,
		public readonly value: number
	) {
		super();
	}

	static from_reader(reader: ByteReader, should_read_name: boolean) {
		const name = read_name(reader, should_read_name);
		const value = reader.read(2)?.as_integer();
		return new NBT_Long(name, value!);
	}

	to_bytes(): Bytes {
		return new Bytes();
	}
}

class NBT_Int extends NBT_Tag {
	constructor(
		public readonly name: string | null,
		public readonly value: number
	) {
		super();
	}

	static from_reader(reader: ByteReader, should_read_name: boolean) {
		const name = read_name(reader, should_read_name);
		const value = reader.read(4)?.as_integer();
		return new NBT_Long(name, value!);
	}

	to_bytes(): Bytes {
		return new Bytes();
	}
}

class NBT_Long extends NBT_Tag {
	constructor(
		public readonly name: string | null,
		public readonly value: number
	) {
		super();
	}

	static from_reader(reader: ByteReader, should_read_name: boolean) {
		const name = read_name(reader, should_read_name);
		const value = reader.read(8)?.as_integer();
		return new NBT_Long(name, value!);
	}

	to_bytes(): Bytes {
		return new Bytes();
	}
}

class NBT_Float extends NBT_Tag {
	constructor(
		public readonly name: string | null,
		public readonly value: number
	) {
		super();
	}

	static from_reader(reader: ByteReader, should_read_name: boolean) {
		const name = read_name(reader, should_read_name);
		const value = reader.read(4)?.as_float();
		return new NBT_Float(name, value!);
	}

	to_bytes(): Bytes {
		return new Bytes();
	}
}

class NBT_Double extends NBT_Tag {
	constructor(
		public readonly name: string | null,
		public readonly value: number
	) {
		super();
	}

	static from_reader(reader: ByteReader, should_read_name: boolean) {
		const name = read_name(reader, should_read_name);
		const value = reader.read(8)?.as_double();
		return new NBT_Float(name, value!);
	}

	to_bytes(): Bytes {
		return new Bytes();
	}
}

class NBT_Byte_Array extends NBT_Tag {
	constructor(
		public readonly name: string | null,
		public readonly length: number,
		public readonly data: Bytes
	) {
		super();
	}

	static from_reader(reader: ByteReader, should_read_name: boolean) {
		const name = read_name(reader, should_read_name);
		const length = reader.read(4)?.as_integer();
		const data = reader.read(length!);
		return new NBT_Byte_Array(name, length!, data!);
	}

	to_bytes(): Bytes {
		return new Bytes();
	}
}

class NBT_String extends NBT_Tag {
	constructor(
		public readonly name: string | null,
		public readonly data: string
	) {
		super();
	}

	static from_reader(reader: ByteReader, should_read_name: boolean) {
		const name = read_name(reader, should_read_name);
		const data_length = reader.read(2)?.as_integer();
		const data = reader.read(data_length!)?.as_string();
		return new NBT_String(name, data!);
	}

	to_bytes(): Bytes {
		return new Bytes();
	}
}

class NBT_List extends NBT_Tag {
	constructor(
		public readonly name: string | null,
		public readonly type_id: number,
		public readonly length: number,
		public readonly tags: NBT_Tag[]
	) {
		super();
	}

	static from_reader(reader: ByteReader, should_read_name: boolean) {
		const name = read_name(reader, should_read_name);
		const type_id = reader.consume();
		const length = reader.read(4)?.as_integer();
		const tags: NBT_Tag[] = [];
		for (let i = 0; i < length!; ++i)
			tags.push(read_nbt_tag(reader, false, type_id!));
		return new NBT_List(name, type_id!, length!, tags);
	}

	to_bytes(): Bytes {
		return new Bytes();
	}
}

class NBT_Compound extends NBT_Tag {
	constructor(
		public readonly name: string | null,
		public readonly tags: NBT_Tag[]
	) {
		super();
	}

	get(name: string) {
		return this.tags
			.filter((tag) => !(tag instanceof NBT_End))
			.find((tag: NBT_Tag) => (tag as any).name == name);
	}

	static from_reader(reader: ByteReader, should_read_name: boolean) {
		const name = read_name(reader, should_read_name);
		const tags: NBT_Tag[] = [];
		for (;;) {
			const tag = read_nbt_tag(reader, true);
			if (tag instanceof NBT_End) break;
			tags.push(tag);
		}
		return new NBT_Compound(name, tags);
	}

	to_bytes(): Bytes {
		return new Bytes();
	}
}

function read_nbt_tag(reader: ByteReader, should_read_name: boolean, type_id?: number): NBT_Tag {
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
			return NBT_Byte_Array.from_reader(
				reader,
				should_read_name
			);
		case NBT_Type.STRING:
			return NBT_String.from_reader(reader, should_read_name);
		case NBT_Type.LIST:
			return NBT_List.from_reader(reader, should_read_name);
		case NBT_Type.COMPOUND:
			return NBT_Compound.from_reader(reader, should_read_name);
		default:
			throw new Error(
				`Unexpected byte ${type} at data index ${
					reader.cursor
				}`
			);
	}
}


export function parse_nbt(bytes: Bytes) {
	const reader = decompress(bytes).reader();
	const compound = read_nbt_tag(reader, true);
	if (!(compound instanceof NBT_Compound))
		throw new Error('NBT expected to start with compound tag but recieved something else.')
	return compound;
}