import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p> </p> <p> </p> <p> </p> <p> </p>`, 1);

export default function Test($$anchor, $$props) {
	let z = 8;

	let b = $.prop($$props, 'b', 19, () => $$props.a),
		c = $.prop($$props, 'c', 19, () => b() * b()),
		d = $.prop($$props, 'd', 19, () => z * b() + c());

	var fragment = root();
	var p = $.first_child(fragment);
	var text = $.only_child(p, true);
	var p_1 = $.sibling(p, 2);
	var text_1 = $.only_child(p_1, true);
	var p_2 = $.sibling(p_1, 2);
	var text_2 = $.only_child(p_2, true);
	var p_3 = $.sibling(p_2, 2);
	var text_3 = $.only_child(p_3, true);

	$.template_effect(() => {
		$.set_text(text, $$props.a);
		$.set_text(text_1, b());
		$.set_text(text_2, c());
		$.set_text(text_3, d());
	});

	$.append($$anchor, fragment);
}