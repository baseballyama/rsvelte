import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Counter from './Counter.svelte';

var root = $.from_html(`<!> <p> </p>`, 1);

export default function Main($$anchor) {
	let object = $.state($.proxy({ count: 0 }));
	var fragment = root();
	var node = $.first_child(fragment);

	Counter(node, {
		get object() {
			return $.get(object);
		},

		set object($$value) {
			$.set(object, $$value, true);
		}
	});

	var p = $.sibling(node, 2);
	var text = $.only_child(p);

	$.template_effect(() => $.set_text(text, `object.count: ${$.get(object).count ?? ''}`));
	$.append($$anchor, fragment);
}