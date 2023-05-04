import pako from "pako";
import { ByteReader, Bytes } from "./bytes";
import { escape } from "querystring";

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
}

class NBT_Short {
	constructor(
		public readonly name: string | null,
		public readonly value: number
	) {}
}

class NBT_Int {
	constructor(
		public readonly name: string | null,
		public readonly value: number
	) {}
}

class NBT_Long {
	constructor(
		public readonly name: string | null,
		public readonly value: number
	) {}
}

class NBT_Float {
	constructor(
		public readonly name: string | null,
		public readonly value: number
	) {}
}

class NBT_Double {
	constructor(
		public readonly name: string | null,
		public readonly value: number
	) {}
}

class NBT_Byte_Array {
	constructor(
		public readonly name: string | null,
		public readonly length: NBT_Int
	) {}
}

class NBT_String {
	constructor(
		public readonly name: string | null,
		public readonly data: string
	) {}
}

class NBT_List {
	constructor(
		public readonly typeId: number,
		public readonly length: number,
		public readonly tags: NBT_Tag[]
	) {}
}

class NBT_Compound {
	constructor(
		public readonly name: string | null,
		public readonly tags: NBT_Tag[]
	) {}
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

function is_gzip_compressed(bytes: Bytes) {
	try {
		pako.ungzip(bytes.as_raw());
		return true;
	} catch (err) {
		return false;
	}
}

function read_nbt_byte(reader: ByteReader, has_name: boolean): NBT_Byte {
	const name_length = reader.read(2)?.as_integer();
	const name = reader.read(name_length!)?.as_string();
	const byte = reader.consume();
	console.log(`Byte(name='${name}') - ${byte}`);
	return new NBT_Byte(name!, byte!);
}

function read_nbt_short(reader: ByteReader, has_name: boolean): NBT_Short {
	const name_length = reader.read(2)?.as_integer();
	const name = reader.read(name_length!)?.as_string();
	const value = reader.read(2)?.as_integer();
	console.log(`Short(name='${name}') - ${value}`);
	return new NBT_Short(name!, value!);
}

function read_nbt_int(reader: ByteReader, has_name: boolean): NBT_Int {
	const name_length = reader.read(2)?.as_integer();
	const name = reader.read(name_length!)?.as_string();
	const value = reader.read(4)?.as_integer();
	console.log(`Int(name='${name}') - ${value}`);
	return new NBT_Int(name!, value!);
}

function read_nbt_long(reader: ByteReader, has_name: boolean): NBT_Long {
	const name_length = reader.read(2)?.as_integer();
	const name = reader.read(name_length!)?.as_string();
	const value = reader.read(8)?.as_integer();
	console.log(`Long(name='${name}') - ${value}`);
	return new NBT_Long(name!, value!);
}

function read_nbt_float(reader: ByteReader, has_name: boolean): NBT_Float {
	const name_length = reader.read(2)?.as_integer();
	const name = reader.read(name_length!)?.as_string();
	const value = reader.read(4)?.as_float();
	console.log(`Float(name='${name}') - ${value}`);
	return new NBT_Float(name!, value!);
}

function read_nbt_double(reader: ByteReader, has_name: boolean): NBT_Double {
	const name_length = reader.read(2)?.as_integer();
	const name = reader.read(name_length!)?.as_string();
	const value = reader.read(4)?.as_integer();
	console.log(`Double(name='${name}') - ${value}`);
	return new NBT_Double(name!, value!);
}

function read_nbt_string(reader: ByteReader, has_name: boolean): NBT_String {
	const name_length = reader.read(2)?.as_integer();
	const name = reader.read(name_length!)?.as_string();
	const data_length = reader.read(2)?.as_integer();
	const data = reader.read(data_length!)?.as_string();
	console.log(`String(name='${name}') - '${escape(data!)}'`);
	return new NBT_String(name!, data!);
}

function read_nbt_list(reader: ByteReader, has_name: boolean): NBT_List {
	const type_id = reader.consume();
	const length = reader.read(4)?.as_integer();
	console.log(`List(type_id=${type_id}, size=${length})`);
	const tags: NBT_Tag[] = [];
	return new NBT_List(type_id!, length!, tags);
}

function read_nbt_compound(reader: ByteReader): NBT_Compound {
	const name_length = reader.read(2)?.as_integer();
	const name = reader.read(name_length!)?.as_string();
	console.log(`Compount(name='${name}')`);
	const tags: NBT_Tag[] = [];
	for (;;) {
		const tag = read_nbt_tag(reader, false);
		if (tag instanceof NBT_End) break;
		tags.push(tag);
	}
	return new NBT_Compound(name!, tags);
}

export function read_nbt_tag(reader: ByteReader, has_name: boolean): NBT_Tag {
	const type = reader.consume();
	switch (type) {
		case NBT_Type.END:
			return new NBT_End(null);
		case NBT_Type.BYTE:
			return read_nbt_byte(reader, has_name);
		case NBT_Type.SHORT:
			return read_nbt_short(reader, has_name);
		case NBT_Type.INT:
			return read_nbt_int(reader, has_name);
		case NBT_Type.LONG:
			return read_nbt_long(reader, has_name);
		case NBT_Type.FLOAT:
			return read_nbt_float(reader, has_name);
		case NBT_Type.DOUBLE:
			return read_nbt_double(reader, has_name);
		case NBT_Type.BYTE_ARRAY:
			throw new Error("todo BYTE_ARRAY");
		case NBT_Type.STRING:
			return read_nbt_string(reader, has_name);
		case NBT_Type.LIST:
			return read_nbt_list(reader, has_name);
		case NBT_Type.COMPOUND:
			return read_nbt_compound(reader);
		default:
			throw new Error(
				`Unexpected byte ${type} at data index ${reader.cursor}`
			);
	}
}

export function read_nbt(bytes: Bytes): NBT_Compound {
	const uncompressed_bytes = is_gzip_compressed(bytes)
		? Bytes.from(pako.ungzip(bytes.as_raw()))
		: bytes;
	const reader = uncompressed_bytes.reader();
	return read_nbt_tag(reader, true) as NBT_Compound;
}
