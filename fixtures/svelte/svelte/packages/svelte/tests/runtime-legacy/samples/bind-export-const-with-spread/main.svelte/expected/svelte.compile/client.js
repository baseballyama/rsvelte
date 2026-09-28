import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Test from "./Test.svelte";

var root = $.from_html(`<!> <p> </p>`, 1);

export default function Main($$anchor) {
	let x;
	var fragment = root();
	var node = $.first_child(fragment);

	Test(node, $.spread_props({}, {
		get x() {
			return x;
		},

		set x($$value) {
			x = $$value;
		}
	}));

	var p = $.sibling(node, 2);
	var text = $.only_child(p, true);

	$.template_effect(() => $.set_text(text, x));
	$.append($$anchor, fragment);
}