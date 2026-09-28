import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Sub from './sub.svelte';

var root = $.from_html(`<!> <button>change handler</button>`, 1);

export default function Main($$anchor) {
	let count = $.state(0);
	let onclick = $.state(() => $.update(count));
	var fragment = root();
	var node = $.first_child(fragment);

	Sub(node, {
		get onclick() {
			return $.get(onclick);
		},

		get increment() {
			return $.get(onclick);
		},

		get count() {
			return $.get(count);
		}
	});

	var button = $.sibling(node, 2);

	$.delegated('click', button, () => {
		$.set(onclick, () => $.update(count, -1));
	});

	$.append($$anchor, fragment);
}

$.delegate(['click']);