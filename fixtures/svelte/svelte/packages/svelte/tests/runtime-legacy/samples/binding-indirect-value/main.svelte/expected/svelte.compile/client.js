import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Component from "./Component.svelte";

var root = $.from_html(` <br/> <!>`, 1);

export default function Main($$anchor) {
	let value = "foo";

	$.next();

	var fragment = root();
	var text = $.first_child(fragment);
	var node = $.sibling(text, 3);

	Component(node, {
		get value() {
			return value;
		},

		set value($$value) {
			value = $$value;
		}
	});

	$.template_effect(() => $.set_text(text, `Parent component "${value ?? ''}"`));
	$.append($$anchor, fragment);
}