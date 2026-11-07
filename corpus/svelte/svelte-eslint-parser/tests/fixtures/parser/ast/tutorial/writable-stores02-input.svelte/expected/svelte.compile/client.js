import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { count } from './stores.js';

var root = $.from_html(`<button>-</button>`);

export default function Writable_stores02_input($$anchor, $$props) {
	$.push($$props, true);

	function decrement() {
		count.update((n) => n - 1);
	}

	var button = root();

	$.event('click', button, decrement);
	$.append($$anchor, button);
	$.pop();
}