import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Nested from './Nested.svelte';

var root = $.from_html(`<button>Click Me</button> <!>`, 1);

export default function Main($$anchor) {
	let nested;
	var fragment = root();
	var button = $.first_child(fragment);
	var node = $.sibling(button, 2);

	$.bind_this(Nested(node, {}), ($$value) => nested = $$value, () => nested);

	$.event('click', button, function (...$$args) {
		(nested && nested.updateText)?.apply(this, $$args);
	});

	$.append($$anchor, fragment);
}