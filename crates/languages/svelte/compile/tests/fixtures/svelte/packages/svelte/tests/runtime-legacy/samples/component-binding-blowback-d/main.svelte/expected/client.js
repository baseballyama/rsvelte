import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import One from "./One.svelte";

var root = $.from_html(`<!> <!> <p> </p> <p> </p>`, 1);

export default function Main($$anchor) {
	const obj = { a: [{}], b: [] };
	var fragment = root();
	var node = $.first_child(fragment);

	One(node, {
		i: 0,
		get list() {
			return obj.a;
		},

		set list($$value) {
			obj.a = $$value;
		}
	});

	var node_1 = $.sibling(node, 2);

	One(node_1, {
		i: 1,
		get list() {
			return obj.b;
		},

		set list($$value) {
			obj.b = $$value;
		}
	});

	var p = $.sibling(node_1, 2);
	var text = $.only_child(p, true);
	var p_1 = $.sibling(p, 2);
	var text_1 = $.only_child(p_1, true);

	$.template_effect(
		($0, $1) => {
			$.set_text(text, $0);
			$.set_text(text_1, $1);
		},
		[
			() => obj.a.map(JSON.stringify),
			() => obj.b.map(JSON.stringify)
		]
	);

	$.append($$anchor, fragment);
}