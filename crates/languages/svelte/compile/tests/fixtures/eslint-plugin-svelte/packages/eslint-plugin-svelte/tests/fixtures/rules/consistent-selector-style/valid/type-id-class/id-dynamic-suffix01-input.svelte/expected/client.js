import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { value } from "package";

var root = $.from_html(`<a>Click me!</a> <a class="svelte-penyk">Click me two!</a> <a class="svelte-penyk">Click me three!</a> <a class="svelte-penyk">Click me four!</a>`, 1);

export default function Id_dynamic_suffix01_input($$anchor) {
	const derived = value + "-link-three";
	var fragment = root();
	var a = $.sibling($.first_child(fragment), 2);
	var a_1 = $.sibling(a, 2);
	var a_2 = $.sibling(a_1, 2);

	$.template_effect(() => {
		$.set_attribute(a, 'id', value + "-link-one");
		$.set_attribute(a_1, 'id', `${value}-link-two`);
		$.set_attribute(a_2, 'id', derived);
	});

	$.append($$anchor, fragment);
}