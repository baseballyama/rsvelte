import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Sub from './sub.svelte';

var root = $.from_html(`<!> <button>Increment</button> <button>Decrement</button> <button>Double</button>`, 1);

export default function Main($$anchor) {
	let sub;
	var fragment = root();
	var node = $.first_child(fragment);

	$.bind_this(Sub(node, {}), ($$value) => sub = $$value, () => sub);

	var button = $.sibling(node, 2);
	var button_1 = $.sibling(button, 2);
	var button_2 = $.sibling(button_1, 2);

	$.event('click', button, () => sub.increment());
	$.event('click', button_1, () => sub.decrement());
	$.event('click', button_2, () => sub.double());
	$.append($$anchor, fragment);
}