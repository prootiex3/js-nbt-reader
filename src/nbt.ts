import { ByteReader, Bytes } from "./bytes";
import { escape } from "querystring";
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

class NBT_End {
	constructor(public readonly name: string | null) {}
}

class NBT_Byte {
	constructor(
		public readonly name: string | null,
		public readonly byte: number
	) {}

	static from_bytes(bytes: Bytes, should_read_name: boolean) {}
}

class NBT_Short {
	constructor(
		public readonly name: string | null,
		public readonly value: number
	) {}

	static from_bytes(bytes: Bytes, should_read_name: boolean) {}
}

class NBT_Int {
	constructor(
		public readonly name: string | null,
		public readonly value: number
	) {}

	static from_bytes(bytes: Bytes, should_read_name: boolean) {}
}

class NBT_Long {
	constructor(
		public readonly name: string | null,
		public readonly value: number
	) {}

	static from_bytes(bytes: Bytes, should_read_name: boolean) {}
}

class NBT_Float {
	constructor(
		public readonly name: string | null,
		public readonly value: number
	) {}

	static from_bytes(bytes: Bytes, should_read_name: boolean) {}
}

class NBT_Double {
	constructor(
		public readonly name: string | null,
		public readonly value: number
	) {}

	static from_bytes(bytes: Bytes, should_read_name: boolean) {}
}

class NBT_Byte_Array {
	constructor(
		public readonly name: string | null,
		public readonly length: number,
		public readonly data: Bytes
	) {}

	static from_bytes(bytes: Bytes, should_read_name: boolean) {}
}

class NBT_String {
	constructor(
		public readonly name: string | null,
		public readonly data: string
	) {}

	static from_bytes(bytes: Bytes, should_read_name: boolean) {}
}

class NBT_List {
	constructor(
		public readonly typeId: number,
		public readonly length: number,
		public readonly tags: NBT_Tag[]
	) {}

	static from_bytes(bytes: Bytes, should_read_name: boolean) {}
}

class NBT_Compound {
	constructor(
		public readonly name: string | null,
		public readonly tags: NBT_Tag[]
	) {}

	static from_bytes(bytes: Bytes, should_read_name: boolean) {}
}

type NBT_Tag =
	| NBT_End
	| NBT_Byte
	| NBT_Short
	| NBT_Int
	| NBT_Long
	| NBT_Float
	| NBT_Double
	| NBT_Byte_Array
	| NBT_String
	| NBT_List
	| NBT_Compound;

function read_nbt_byte(
	reader: ByteReader,
	should_read_name: boolean
): NBT_Byte {
	let name: string | null = null;
	if (should_read_name) {
		const name_length = reader.read(2)?.as_integer();
		name = reader.read(name_length!)?.as_string()!;
	}
	const byte = reader.consume();
	console.log(`Byte(name=${name == null ? null : `'${name}'`}) - ${byte}`);
	return new NBT_Byte(name!, byte!);
}

function read_nbt_short(
	reader: ByteReader,
	should_read_name: boolean
): NBT_Short {
	let name: string | null = null;
	if (should_read_name) {
		const name_length = reader.read(2)?.as_integer();
		name = reader.read(name_length!)?.as_string()!;
	}
	const value = reader.read(2)?.as_integer();
	console.log(`Short(name=${name == null ? null : `'${name}'`}) - ${value}`);
	return new NBT_Short(name!, value!);
}

function read_nbt_int(reader: ByteReader, should_read_name: boolean): NBT_Int {
	let name: string | null = null;
	if (should_read_name) {
		const name_length = reader.read(2)?.as_integer();
		name = reader.read(name_length!)?.as_string()!;
	}
	const value = reader.read(4)?.as_integer();
	console.log(`Int(name=${name == null ? null : `'${name}'`}) - ${value}`);
	return new NBT_Int(name!, value!);
}

function read_nbt_long(
	reader: ByteReader,
	should_read_name: boolean
): NBT_Long {
	let name: string | null = null;
	if (should_read_name) {
		const name_length = reader.read(2)?.as_integer();
		name = reader.read(name_length!)?.as_string()!;
	}
	const value = reader.read(8)?.as_integer();
	console.log(`Long(name=${name == null ? null : `'${name}'`}) - ${value}`);
	return new NBT_Long(name!, value!);
}

function read_nbt_float(
	reader: ByteReader,
	should_read_name: boolean
): NBT_Float {
	let name: string | null = null;
	if (should_read_name) {
		const name_length = reader.read(2)?.as_integer();
		name = reader.read(name_length!)?.as_string()!;
	}
	const value = reader.read(4)?.as_float();
	console.log(`Float(name=${name == null ? null : `'${name}'`}) - ${value}`);
	return new NBT_Float(name!, value!);
}

function read_nbt_double(
	reader: ByteReader,
	should_read_name: boolean
): NBT_Double {
	let name: string | null = null;
	if (should_read_name) {
		const name_length = reader.read(2)?.as_integer();
		name = reader.read(name_length!)?.as_string()!;
	}
	const value = reader.read(4)?.as_integer();
	console.log(`Double(name=${name == null ? null : `'${name}'`}) - ${value}`);
	return new NBT_Double(name!, value!);
}

function read_nbt_byte_array(
	reader: ByteReader,
	should_read_name: boolean
): NBT_Byte_Array {
	let name: string | null = null;
	if (should_read_name) {
		const name_length = reader.read(2)?.as_integer();
		name = reader.read(name_length!)?.as_string()!;
	}
	const length = reader.read(4)?.as_integer();
	console.log(
		`Byte_Array(name=${
			name == null ? null : `'${name}'`
		}) - (${length} bytes...)`
	);
	const data = reader.read(length!);
	return new NBT_Byte_Array(name, length!, data!);
}

function read_nbt_string(
	reader: ByteReader,
	should_read_name: boolean
): NBT_String {
	let name: string | null = null;
	if (should_read_name) {
		const name_length = reader.read(2)?.as_integer();
		name = reader.read(name_length!)?.as_string()!;
	}
	const data_length = reader.read(2)?.as_integer();
	const data = reader.read(data_length!)?.as_string();
	console.log(
		`String(name=${name == null ? null : `'${name}'`}) - '${escape(data!)}'`
	);
	return new NBT_String(name!, data!);
}

function read_nbt_list(
	reader: ByteReader,
	should_read_name: boolean
): NBT_List {
	let name: string | null = null;
	if (should_read_name) {
		const name_length = reader.read(2)?.as_integer();
		name = reader.read(name_length!)?.as_string()!;
	}
	const type_id = reader.consume();
	const length = reader.read(4)?.as_integer();
	const tags: NBT_Tag[] = [];
	console.log(`List(type_id=${type_id}, size=${length})`);
	for (let i = 0; i < length!; ++i) {
		tags.push(read_nbt_tag(reader, false, type_id!));
	}
	return new NBT_List(type_id!, length!, tags);
}

function read_nbt_compound(
	reader: ByteReader,
	should_read_name: boolean
): NBT_Compound {
	let name: string | null = null;
	if (should_read_name) {
		const name_length = reader.read(2)?.as_integer();
		name = reader.read(name_length!)?.as_string()!;
	}
	console.log(`Compound(name=${name == null ? null : `'${name}'`})`);
	const tags: NBT_Tag[] = [];
	for (;;) {
		const tag = read_nbt_tag(reader, true);
		if (tag instanceof NBT_End) break;
		tags.push(tag);
	}
	return new NBT_Compound(name!, tags);
}

export function read_nbt_tag(
	reader: ByteReader,
	should_read_name: boolean,
	type_id?: number
): NBT_Tag {
	const type = type_id ?? reader.consume();
	switch (type) {
		case NBT_Type.END:
			return new NBT_End(null);
		case NBT_Type.BYTE:
			return read_nbt_byte(reader, should_read_name);
		case NBT_Type.SHORT:
			return read_nbt_short(reader, should_read_name);
		case NBT_Type.INT:
			return read_nbt_int(reader, should_read_name);
		case NBT_Type.LONG:
			return read_nbt_long(reader, should_read_name);
		case NBT_Type.FLOAT:
			return read_nbt_float(reader, should_read_name);
		case NBT_Type.DOUBLE:
			return read_nbt_double(reader, should_read_name);
		case NBT_Type.BYTE_ARRAY:
			return read_nbt_byte_array(reader, should_read_name);
		case NBT_Type.STRING:
			return read_nbt_string(reader, should_read_name);
		case NBT_Type.LIST:
			return read_nbt_list(reader, should_read_name);
		case NBT_Type.COMPOUND:
			return read_nbt_compound(reader, should_read_name);
		default:
			throw new Error(
				`Unexpected byte ${type} at data index ${reader.cursor}`
			);
	}
}

export class NBTParser {
	constructor() {
		throw new TypeError("Illegal constructor");
	}

	static from_bytes(bytes: Bytes): NBT_Compound {
		const uncompressed_bytes = decompress(bytes);
		const reader = uncompressed_bytes.reader();
		return read_nbt_tag(reader, true) as NBT_Compound;
	}
}
