import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Sub from './sub.svelte';

var root = $.from_html(`<!> <button>Increment</button>`, 1);

export default function Main($$anchor) {
	let button;
	var fragment = root();
	var node = $.first_child(fragment);

	$.bind_this(Sub(node, {}), ($$value) => button = $$value, () => button);

	var button_1 = $.sibling(node, 2);

	$.event('click', button_1, () => button.increment());
	$.append($$anchor, fragment);
}