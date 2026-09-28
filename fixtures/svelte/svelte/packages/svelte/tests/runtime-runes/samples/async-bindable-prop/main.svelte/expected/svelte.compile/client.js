import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Child from './Child.svelte';

var root = $.from_html(`<!> <p> </p>`, 1);

export default function Main($$anchor) {
	let value = $.state('initial');
	var fragment = root();
	var node = $.first_child(fragment);

	Child(node, {
		get value() {
			return $.get(value);
		},

		set value($$value) {
			$.set(value, $$value, true);
		}
	});

	var p = $.sibling(node, 2);
	var text = $.only_child(p, true);

	$.template_effect(() => $.set_text(text, $.get(value)));
	$.append($$anchor, fragment);
}