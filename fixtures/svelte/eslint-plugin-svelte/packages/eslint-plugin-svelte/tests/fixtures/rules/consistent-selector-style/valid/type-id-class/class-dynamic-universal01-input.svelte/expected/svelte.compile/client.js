import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { value } from "package";

var root = $.from_html(`<a>Click me!</a> <a>Click me two!</a> <a>Click me two!</a>`, 1);

export default function Class_dynamic_universal01_input($$anchor) {
	var fragment = root();
	var a = $.sibling($.first_child(fragment), 2);
	var a_1 = $.sibling(a, 2);

	$.template_effect(() => {
		$.set_class(a, 1, $.clsx(value), 'svelte-1w6kh5p');
		$.set_class(a_1, 1, $.clsx(value), 'svelte-1w6kh5p');
	});

	$.append($$anchor, fragment);
}