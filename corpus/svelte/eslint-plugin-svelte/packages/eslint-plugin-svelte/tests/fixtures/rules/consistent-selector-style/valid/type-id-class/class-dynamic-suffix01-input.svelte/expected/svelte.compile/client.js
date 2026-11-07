import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { value } from "package";

var root = $.from_html(`<b>Bold in each</b>`);
var root_1 = $.from_html(`<a>Click me!</a> <a>Click me two!</a> <a>Click me two!</a> <a>Click me three!</a> <a>Click me three!</a> <a>Click me four!</a> <a>Click me four!</a> <!>`, 1);

export default function Class_dynamic_suffix01_input($$anchor) {
	const derived = value + "-link-three";
	var fragment = root_1();
	var a = $.sibling($.first_child(fragment), 2);
	var a_1 = $.sibling(a, 2);
	var a_2 = $.sibling(a_1, 2);
	var a_3 = $.sibling(a_2, 2);
	var a_4 = $.sibling(a_3, 2);
	var a_5 = $.sibling(a_4, 2);
	var node = $.sibling(a_5, 2);

	$.each(node, 16, () => ["one", "two"], $.index, ($$anchor, count) => {
		var b = root();

		$.template_effect(() => $.set_class(b, 1, "bold-" + count, 'svelte-1yi7u1b'));
		$.append($$anchor, b);
	});

	$.template_effect(() => {
		$.set_class(a, 1, value + "-link-one", 'svelte-1yi7u1b');
		$.set_class(a_1, 1, value + "-link-one", 'svelte-1yi7u1b');
		$.set_class(a_2, 1, `${value}-link-two`, 'svelte-1yi7u1b');
		$.set_class(a_3, 1, `${value}-link-two`, 'svelte-1yi7u1b');
		$.set_class(a_4, 1, $.clsx(derived), 'svelte-1yi7u1b');
		$.set_class(a_5, 1, $.clsx(derived), 'svelte-1yi7u1b');
	});

	$.append($$anchor, fragment);
}