import axios from "axios";
import fs from "fs";
import { NBT_Compound, parse_nbt } from "./nbt";

const TEST_SERVERS_DAT =
	"https://github.com/Jake-E/go-serversdat/raw/master/examples/servers.dat";

const TEST_BIGTEST =
	"https://raw.github.com/Dav1dde/nbd/master/test/bigtest.nbt";

const TEST_HELLO_WORLD =
	"https://raw.github.com/Dav1dde/nbd/master/test/hello_world.nbt";

async function from_url(url: string) {
	const nbt_raw = await axios.get(url, {
		responseType: "arraybuffer",
	});
	if (nbt_raw.status != 200) throw new Error("Failed to fetch NBT file.");
	return nbt_raw;
}

function from_file(file_path: string): Promise<{ data: ArrayBufferLike }> {
	return new Promise((resolve, reject) => {
		fs.readFile(file_path, {}, (err, data: Buffer) => {
			if (err != null) reject(err);
			resolve({
				data: data.buffer,
			});
		});
	});
}

(async function main() {
	console.clear();
	// const nbt_raw = await from_url(TEST_SERVERS_DAT);
	const nbt_raw = await from_file("data/level.dat");
	const nbt = parse_nbt(new Uint8Array(nbt_raw.data as ArrayBuffer));
	const data = nbt.get("Data")! as NBT_Compound;
	const player = data.get("Player")! as NBT_Compound;
	console.log(player);
	// console.dir(nbt, { depth: Infinity });
})();
