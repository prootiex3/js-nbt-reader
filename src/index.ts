import axios from "axios";
import { Bytes } from "./bytes";
import { parse_nbt } from "./nbt";

const TEST_SERVERS_DAT =
	"https://github.com/Jake-E/go-serversdat/raw/master/examples/servers.dat";

const TEST_BIGTEST =
	"https://raw.github.com/Dav1dde/nbd/master/test/bigtest.nbt";

const TEST_HELLO_WORLD =
	"https://raw.github.com/Dav1dde/nbd/master/test/hello_world.nbt";

(async function main() {
	console.clear();
	const nbt_raw = await axios.get(TEST_BIGTEST, {
		responseType: "arraybuffer",
	});
	if (nbt_raw.status != 200) throw new Error("Failed to fetch NBT file.");
	const nbt_bytes = Bytes.from(new Uint8Array(nbt_raw.data as ArrayBuffer));
	const nbt = parse_nbt(nbt_bytes);
	console.dir(nbt, { depth: Infinity });
})();
