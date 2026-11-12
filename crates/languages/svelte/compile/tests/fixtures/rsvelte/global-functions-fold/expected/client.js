import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
var root = $.from_html(`<p> </p> <p></p>`, 1);
export default function Global_functions_fold($$anchor) {
	let n = 1;
	const a = Number.parseInt(" -0x1f");
	const b = Number.parseInt("z", 36);
	const c = Number.parseFloat("1e3x");
	const d = String.fromCharCode(72, 105);
	const e = String.fromCodePoint(128512);
	const f = Math.f16round(1.337);
	const g = Math.round(-.4);
	const h = Math.pow(1, "x");
	const i = Math.max(...[1, n]);
	var fragment = root();
	var p = $.first_child(fragment);
	var text = $.only_child(p);
	var p_1 = $.sibling(p, 2);
	p_1.textContent = 1 ** Infinity;
	$.template_effect(() => $.set_text(text, `-31 35 1000 Hi 😀 1.3369140625 0 NaN ${i ?? ""}`));
	$.append($$anchor, fragment);
}
