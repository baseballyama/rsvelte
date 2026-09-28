import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Counter from './Counter.svelte';

var root = $.from_html(`<!> <p> </p>`, 1);

export default function Main($$anchor) {
	let x;
	var fragment = root();
	var node = $.first_child(fragment);

	Counter(node, {
		get count() {
			return x;
		},

		set count($$value) {
			x = $$value;
		}
	});

	var p = $.sibling(node, 2);
	var text = $.only_child(p);

	$.template_effect(() => $.set_text(text, `count: ${x ?? ''}`));
	$.append($$anchor, fragment);
}