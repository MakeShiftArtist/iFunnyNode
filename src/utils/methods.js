import crypto from "crypto";

/**
 * Capitalizes the first character of a string and makes the rest lowercase
 * @param {String} string
 * @returns {String} The capitalized version of the string
 * @example
 * capitalize("hElLO WoRld") // Hello world
 */
export function capitalize(string) {
	return string[0].toUpperCase() + string.slice(1).toLowerCase();
}

/**
 * Asynchronously waits for a specified amount of time (in seconds)
 * @param {Number} seconds Amount of seconds to sleep for
 * @returns {Promise<void>} A promise that is resolved when the sleep is complete
 */
export function sleep(seconds) {
	return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}

/**
 * Creates a basic token for iFunny requests\
 * Basic auth tokens MUST be `156` characters long
 * Basic auth tokens *should* also be made using UUIDv4
 * @returns {String} The basic auth token
 */
export function create_basic_token() {
	let hex = crypto.randomBytes(32).toString("hex").toUpperCase();
	let a = hex + "_MsOIJ39Q28:";
	let b = hex + ":MsOIJ39Q28:PTDc3H8a)Vi=UYap";
	let c = crypto.createHash("sha1").update(b).digest("hex");
	return Buffer.from(a + c).toString("base64");
}

export default {
	capitalize,
	sleep,
	create_basic_token,
};
