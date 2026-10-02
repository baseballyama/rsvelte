import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { a } from './a.svelte';
import B from './b.svelte';
import { b } from './b.svelte.js';
import { c } from './c.svelte';
import D from './d.svelte';
import { d } from './d.svelte.js';

var root = $.from_html(`<!> <!>`, 1);

export default function Input($$anchor) {
	a;
	b;
	c;
	d;

	var fragment = root();
	var node = $.first_child(fragment);

	B(node, {});

	var node_1 = $.sibling(node, 2);

	D(node_1, {});
	$.append($$anchor, fragment);
}