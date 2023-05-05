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
		public readonly name: string | null,
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

	get(name: string) {
		return this.tags.find((tag: NBT_Tag) => tag.name == name);
	}

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

export class NBTParser {
	constructor(bytes: Bytes) {
		this.#m_bytes = decompress(bytes);
		this.#m_reader = this.#m_bytes.reader();
	}

	parse(): NBT_Compound | null {
		return this.read_nbt_tag(true) as NBT_Compound;
	}

	read_nbt_tag(should_read_name: boolean, type_id?: number): NBT_Tag {
		const type = type_id ?? this.#m_reader.consume();
		switch (type) {
			case NBT_Type.END:
				return new NBT_End(null);
			case NBT_Type.BYTE:
				return this.read_nbt_byte(should_read_name);
			case NBT_Type.SHORT:
				return this.read_nbt_short(should_read_name);
			case NBT_Type.INT:
				return this.read_nbt_int(should_read_name);
			case NBT_Type.LONG:
				return this.read_nbt_long(should_read_name);
			case NBT_Type.FLOAT:
				return this.read_nbt_float(should_read_name);
			case NBT_Type.DOUBLE:
				return this.read_nbt_double(should_read_name);
			case NBT_Type.BYTE_ARRAY:
				return this.read_nbt_byte_array(should_read_name);
			case NBT_Type.STRING:
				return this.read_nbt_string(should_read_name);
			case NBT_Type.LIST:
				return this.read_nbt_list(should_read_name);
			case NBT_Type.COMPOUND:
				return this.read_nbt_compound(should_read_name);
			default:
				throw new Error(
					`Unexpected byte ${type} at data index ${
						this.#m_reader.cursor
					}`
				);
		}
	}

	consume_name(should_read_name: boolean) {
		if (!should_read_name) return null;
		const name_length = this.#m_reader.read(2)?.as_integer();
		const name = this.#m_reader.read(name_length!)?.as_string()!;
		return name;
	}

	// parse functions
	read_nbt_byte(should_read_name: boolean): NBT_Byte {
		const name = this.consume_name(should_read_name);
		const byte = this.#m_reader.consume();
		return new NBT_Byte(name!, byte!);
	}

	read_nbt_short(should_read_name: boolean): NBT_Short {
		const name = this.consume_name(should_read_name);
		const value = this.#m_reader.read(2)?.as_integer();
		return new NBT_Short(name!, value!);
	}

	read_nbt_int(should_read_name: boolean): NBT_Int {
		const name = this.consume_name(should_read_name);
		const value = this.#m_reader.read(4)?.as_integer();
		return new NBT_Int(name!, value!);
	}

	read_nbt_long(should_read_name: boolean): NBT_Long {
		const name = this.consume_name(should_read_name);
		const value = this.#m_reader.read(8)?.as_integer();
		return new NBT_Long(name!, value!);
	}

	read_nbt_float(should_read_name: boolean): NBT_Float {
		const name = this.consume_name(should_read_name);
		const value = this.#m_reader.read(4)?.as_float();
		return new NBT_Float(name!, value!);
	}

	read_nbt_double(should_read_name: boolean): NBT_Double {
		const name = this.consume_name(should_read_name);
		const value = this.#m_reader.read(8)?.as_double();
		return new NBT_Double(name!, value!);
	}

	read_nbt_byte_array(should_read_name: boolean): NBT_Byte_Array {
		const name = this.consume_name(should_read_name);
		const length = this.#m_reader.read(4)?.as_integer();
		const data = this.#m_reader.read(length!);
		return new NBT_Byte_Array(name, length!, data!);
	}

	read_nbt_string(should_read_name: boolean): NBT_String {
		const name = this.consume_name(should_read_name);
		const data_length = this.#m_reader.read(2)?.as_integer();
		const data = this.#m_reader.read(data_length!)?.as_string();
		return new NBT_String(name!, data!);
	}

	read_nbt_list(should_read_name: boolean): NBT_List {
		const name = this.consume_name(should_read_name);
		const type_id = this.#m_reader.consume();
		const length = this.#m_reader.read(4)?.as_integer();
		const tags: NBT_Tag[] = [];
		for (let i = 0; i < length!; ++i)
			tags.push(this.read_nbt_tag(false, type_id!));
		return new NBT_List(name, type_id!, length!, tags);
	}

	read_nbt_compound(should_read_name: boolean): NBT_Compound {
		const name = this.consume_name(should_read_name);
		const tags: NBT_Tag[] = [];
		for (;;) {
			const tag = this.read_nbt_tag(true);
			if (tag instanceof NBT_End) break;
			tags.push(tag);
		}
		return new NBT_Compound(name!, tags);
	}

	// private:
	#m_bytes: Bytes;
	#m_reader: ByteReader;
}
