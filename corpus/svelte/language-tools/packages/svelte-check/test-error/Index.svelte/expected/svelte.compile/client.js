import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Jsdoc from './Jsdoc.svelte';
import { foo } from './relative';
import nope from '../../outside';

var root = $.from_html(`<p></p> <!>`, 1);

export default function Index($$anchor) {
	let count = 'oops';
	let x = 0;

	// prettier-ignore
	x === '2';

	foo === '';

	var fragment = root();
	var p = $.first_child(fragment);

	p.textContent = 'oops';

	var node = $.sibling(p, 2);

	Jsdoc(node, {});
	$.append($$anchor, fragment);
}