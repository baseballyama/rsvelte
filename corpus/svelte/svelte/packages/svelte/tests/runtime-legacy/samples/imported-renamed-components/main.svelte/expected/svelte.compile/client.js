import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ComponentOne from './ComponentOne.svelte';
import ComponentTwo from './ComponentTwo.svelte';

var root = $.from_html(`<!><!>`, 1);

export default function Main($$anchor) {
	const RenamedComponentOne = ComponentOne;
	const RenamedComponentTwo = ComponentTwo;
	var fragment = root();
	var node = $.first_child(fragment);

	RenamedComponentOne(node, {});

	var node_1 = $.sibling(node);

	RenamedComponentTwo(node_1, {});
	$.append($$anchor, fragment);
}