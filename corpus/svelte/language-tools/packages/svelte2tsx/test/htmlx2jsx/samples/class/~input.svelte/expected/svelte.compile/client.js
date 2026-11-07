import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<h1>Hello</h1> <h1>Hello</h1>`, 1);

export default function Input($$anchor) {
	var fragment = root();
	var h1 = $.first_child(fragment);

	$.set_class(h1, 1, '', null, {}, { active: "test" == "test" });

	var h1_1 = $.sibling(h1, 2);

	$.set_class(h1_1, 1, '', null, {}, { active: "test" == "test" });
	$.append($$anchor, fragment);
}