import { Bytes } from "./bytes";
import pako from "pako";

// Minecraft Anvil Format
export class Region {
	constructor(public readonly data: Bytes) {}
}

export class Chunk {
	constructor(public readonly data: Bytes) {}
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
