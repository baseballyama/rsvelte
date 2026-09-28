import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Child from './Child.svelte';

var root = $.from_html(`<!> <p> </p>`, 1);

export default function Main($$anchor) {
	let object = $.state({ count: 0 });
	var fragment = root();
	var node = $.first_child(fragment);

	Child(node, {
		get object() {
			return $.get(object);
		},

		set object($$value) {
			$.set(object, $$value);
		}
	});

	var p = $.sibling(node, 2);
	var text = $.only_child(p, true);

	$.template_effect(() => $.set_text(text, $.get(object).count));
	$.append($$anchor, fragment);
}