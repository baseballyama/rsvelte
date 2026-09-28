import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Counter from './Counter.svelte';

var root = $.from_html(`<p> </p> <!> <!> <!> <!>`, 1);

export default function Main($$anchor) {
	let bound = $.state(0);
	let bound_nested = $.proxy({ count: 0 });
	let unbound = 0;
	let unbound_nested = $.proxy({ count: 0 });
	var fragment = root();
	var p = $.first_child(fragment);
	var text = $.only_child(p);
	var node = $.sibling(p, 2);

	Counter(node, {
		get count() {
			return $.get(bound);
		},

		set count($$value) {
			$.set(bound, $$value, true);
		}
	});

	var node_1 = $.sibling(node, 2);

	Counter(node_1, {
		get count() {
			return bound_nested.count;
		},

		set count($$value) {
			bound_nested.count = $$value;
		}
	});

	var node_2 = $.sibling(node_1, 2);

	Counter(node_2, { count: unbound });

	var node_3 = $.sibling(node_2, 2);

	Counter(node_3, {
		get count() {
			return unbound_nested.count;
		}
	});

	$.template_effect(() => $.set_text(text, `${$.get(bound) ?? ''} ${bound_nested.count ?? ''} 0 ${unbound_nested.count ?? ''}`));
	$.append($$anchor, fragment);
}