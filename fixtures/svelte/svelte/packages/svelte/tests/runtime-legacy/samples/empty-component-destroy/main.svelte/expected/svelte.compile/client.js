import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Empty from './Empty.svelte';

var root = $.from_html(`<button>destroy component</button> <!>`, 1);

export default function Main($$anchor) {
	let active = true;
	var fragment = root();
	var button = $.first_child(fragment);
	var node = $.sibling(button, 2);

	$.component(node, () => active ? Empty : null, ($$anchor, $$component) => {
		$$component($$anchor, {});
	});

	$.event('click', button, () => active = false);
	$.append($$anchor, fragment);
}