import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { value } from "package";

var root = $.from_html(`<a>Click me!</a> <a class="svelte-h856ne">Click me two!</a> <a class="svelte-h856ne">Click me two!</a>`, 1);

export default function Id_dynamic_universal01_input($$anchor) {
	var fragment = root();
	var a = $.sibling($.first_child(fragment), 2);
	var a_1 = $.sibling(a, 2);

	$.template_effect(() => {
		$.set_attribute(a, 'id', value);
		$.set_attribute(a_1, 'id', value);
	});

	$.append($$anchor, fragment);
}