import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
export const answer = 42;
export function double(n) {
	return n * 2;
}
var root = $.from_html(`<enhanced:img src="./a.png"></enhanced:img>`);
export default function Exports($$anchor) {
	let value = "";
	var enhanced_img = root();
	$.set_attribute(enhanced_img, "alt", value);
	$.append($$anchor, enhanced_img);
}
