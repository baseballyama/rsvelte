import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<!> <button>click me</button>`, 1);

export default function Counter($$anchor, $$props) {
	let count = $.state(0);
	var fragment = root();
	var node = $.first_child(fragment);

	$.snippet(node, () => $$props.foo, () => $.get(count));

	var button = $.sibling(node, 2);

	$.event('click', button, () => $.set(count, $.get(count) + 1));
	$.append($$anchor, fragment);
}