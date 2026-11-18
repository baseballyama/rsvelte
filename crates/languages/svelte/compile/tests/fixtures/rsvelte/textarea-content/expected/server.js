import * as $ from "svelte/internal/server";
export default function Textarea_content($$renderer) {
	let a = "x";
	$$renderer.push(`<textarea>`);
	const $$body = $.escape("\n\nx b");
	if ($$body) {
		$$renderer.push(`${$$body}`);
	} else {}
	$$renderer.push(`</textarea> <textarea>`);
	const $$body_1 = $.escape("x & x!");
	if ($$body_1) {
		$$renderer.push(`${$$body_1}`);
	} else {}
	$$renderer.push(`</textarea> <textarea>`);
	const $$body_2 = $.escape("x c");
	if ($$body_2) {
		$$renderer.push(`${$$body_2}`);
	} else {}
	$$renderer.push(`</textarea> <textarea>`);
	const $$body_3 = $.escape("<b>x</b>");
	if ($$body_3) {
		$$renderer.push(`${$$body_3}`);
	} else {}
	$$renderer.push(`</textarea>`);
}
