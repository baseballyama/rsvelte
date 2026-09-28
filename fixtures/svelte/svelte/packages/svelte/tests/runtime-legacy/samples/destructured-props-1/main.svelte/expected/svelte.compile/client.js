import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import A from './A.svelte';

var root = $.from_html(`<!> <br/> <!>`, 1);

export default function Main($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	A(node, {});

	var node_1 = $.sibling(node, 4);

	A(node_1, {
		a: 'a',
		d_one: 'd_one',
		list_one: 'list_one',
		f: 'f',
		list_two_b: 'list_two_b',
		g: 'g',
		A: 'A',
		C: 'C'
	});

	$.append($$anchor, fragment);
}