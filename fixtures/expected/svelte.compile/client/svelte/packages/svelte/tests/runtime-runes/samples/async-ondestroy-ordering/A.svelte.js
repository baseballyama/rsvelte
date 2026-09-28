import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onDestroy } from 'svelte';
import { destroyed } from './destroyed.js';
import C from './C.svelte';

var root = $.from_html(`<div>A</div> <!>`, 1);

export default function A($$anchor, $$props) {
	$.push($$props, true);
	onDestroy(() => destroyed.push('A'));

	var fragment = root();
	var node = $.sibling($.first_child(fragment), 2);

	C(node, {});
	$.append($$anchor, fragment);
	$.pop();
}