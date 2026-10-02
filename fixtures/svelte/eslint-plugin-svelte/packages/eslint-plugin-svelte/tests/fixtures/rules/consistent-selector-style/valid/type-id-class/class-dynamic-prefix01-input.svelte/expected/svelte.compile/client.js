import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { value } from "package";

var root = $.from_html(`<a>Click me!</a> <a>Click me two!</a> <a>Click me two!</a> <a>Click me three!</a> <a>Click me three!</a> <a>Click me four!</a> <a>Click me four!</a>`, 1);

export default function Class_dynamic_prefix01_input($$anchor) {
	const derived = "link-three-" + value;
	var fragment = root();
	var a = $.sibling($.first_child(fragment), 2);
	var a_1 = $.sibling(a, 2);
	var a_2 = $.sibling(a_1, 2);
	var a_3 = $.sibling(a_2, 2);
	var a_4 = $.sibling(a_3, 2);
	var a_5 = $.sibling(a_4, 2);

	$.template_effect(() => {
		$.set_class(a, 1, "link-one-" + value, 'svelte-1iqqopw');
		$.set_class(a_1, 1, "link-one-" + value, 'svelte-1iqqopw');
		$.set_class(a_2, 1, `link-two-${value}`, 'svelte-1iqqopw');
		$.set_class(a_3, 1, `link-two-${value}`, 'svelte-1iqqopw');
		$.set_class(a_4, 1, $.clsx(derived), 'svelte-1iqqopw');
		$.set_class(a_5, 1, $.clsx(derived), 'svelte-1iqqopw');
	});

	$.append($$anchor, fragment);
}