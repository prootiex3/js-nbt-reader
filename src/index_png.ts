import axios from "axios";
import pako from "pako";
import { Optional } from "./util";
import { Bytes } from "./bytes";
import assert from "assert";

interface RGBA {
	r: number;
	g: number;
	b: number;
	a?: number;
}

interface PNG_Data {
	width: number;
	height: number;
	pixels: RGBA[];
}

function process_png(bytes: Bytes): PNG_Data {
	const png_reader = bytes.reader();
	if (!Bytes.compare(png_reader.read(8), [137, 80, 78, 71, 13, 10, 26, 10]))
		throw new TypeError(
			"PNG header is either invalid or this is not a PNG."
		);

	let width: Optional<number> = null,
		height: Optional<number> = null,
		pixels: RGBA[] = [],
		chunks = 0;
	main: while (!png_reader.is_eof()) {
		const ch_length = png_reader.read(4).as_integer();
		const ch_type = png_reader.read(4).as_string();
		const ch_data = png_reader.read(ch_length);
		const ch_crc = png_reader.read(4).as_hex();

		chunks++;
		switch (ch_type) {
			case "IHDR":
				const ihdr = ch_data.reader();
				const ihdr_width = ihdr.read(4).as_integer();
				const ihdr_height = ihdr.read(4).as_integer();
				const ihdr_bit_depth = ihdr.consume();
				const ihdr_color_type = ihdr.consume();
				const ihdr_compression_method = ihdr.consume();
				const ihdr_filter_method = ihdr.consume();
				const ihdr_interlace_method = ihdr.consume();

				if (ihdr_width != null) width = ihdr_width;
				if (ihdr_height != null) height = ihdr_height;

				break;
			case "IDAT":
				const idat = Bytes.from(
					pako.inflate(ch_data?.as_raw())
				).reader();
				assert(
					idat.length % 4 == 0,
					"Image data is not divisible by 4"
				);
				while (!idat.is_eof()) {
					const [r, g, b, a] = idat.read(4);
					pixels.push({
						r,
						g,
						b,
						a,
					});
				}
				break;
			case "IEND":
				break main;
			default:
				// throw new Error(`Unknown type: ${ch_type}`);
				break;
		}

		console.log(
			`Type: ${ch_type}\nLength: ${ch_length}\nCRC: 0x${ch_crc}\n`
		);
	}

	if (width == null || height == null) {
		throw new Error("Width and or Height of PNG is null");
	}

	console.log(`The PNG is ${width}x${height} and has ${chunks} chunks`);
	return {
		width,
		height,
		pixels,
	};
}

// Main
async function main() {
	console.clear();
	const image = await axios.get(
		"https://www.google.com/images/branding/googlelogo/1x/googlelogo_light_color_272x92dp.png",
		{ responseType: "arraybuffer" }
	);
	if (image.status != 200) throw new Error("Failed to fetch google image.");
	const image_data = process_png(
		Bytes.from(new Uint8Array(image.data as ArrayBuffer))
	);
	console.log(image_data);
}

main();
