import "svelte/internal/init-operations";
import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
var rest_excludes = new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	16,
	1000,
	1000
]);
var root = $.from_html(` <!>`, 1);
export default function Numbers_as_written($$anchor, $$props) {
	let o = {
		0x10: 1,
		[0b11]: 2,
		0o17: 3,
		1_000: 4,
		1e-7: 5,
		0x1fn: 6,
		.5: 7
	};
	let rest = $.rest_props($$props, rest_excludes);
	let m = o.x ?? 0xff;
	let xs = [];
	$.next();
	var fragment = root();
	var text = $.first_child(fragment);
	var node = $.sibling(text);
	$.each(node, 17, () => xs, $.index, ($$anchor, x) => {
		const computed_const = $.derived(() => {
			const { 0x10: d } = $.get(x);
			return { d };
		});
		$.next();
		var text_1 = $.text();
		$.template_effect(() => $.set_text(text_1, $.get(computed_const).d));
		$.append($$anchor, text_1);
	});
	$.template_effect(() => $.set_text(text, `${$$props["16"] ?? ""}${$$props["1000"] ?? ""}${$$props["1000"] ?? ""}${m ?? ""}${rest ?? ""} `));
	$.append($$anchor, fragment);
}
