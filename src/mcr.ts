import { Bytes } from "./bytes";
import pako from "pako";

// Minecraft Anvil Format
export class Region {
	constructor() {}

	static from(data: Bytes): Region {
		const reader = data.reader();
		return new Region();
	}
}

export class Chunk {
	constructor() {}

	static from(data: Bytes): Chunk {
		const reader = data.reader();
		return new Chunk();
	}
}

export class Block {
	public readonly namespace: string;
	public readonly id: string;
	public readonly name: string;
	public readonly properties: { [key: string]: any };
	constructor(
		namespace: string = "minecraft",
		id: string = namespace,
		properties: { [key: string]: any } = {}
	) {
		this.namespace = namespace;
		this.id = id;
		this.name = `${namespace}:${id}`;
		this.properties = properties;
	}
}
