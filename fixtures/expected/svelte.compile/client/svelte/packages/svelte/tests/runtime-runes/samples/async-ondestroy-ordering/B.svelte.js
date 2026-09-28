import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onDestroy } from 'svelte';
import { destroyed } from './destroyed.js';

var root = $.from_html(`<div>B</div>`);

export default function B($$anchor, $$props) {
	$.push($$props, true);
	onDestroy(() => destroyed.push('B'));
	onDestroy(() => destroyed.push('B*'));

	var div = root();

	$.append($$anchor, div);
	$.pop();
}