import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { count } from './stores.js';

var root = $.from_html(`<button>reset</button>`);

export default function Writable_stores04_input($$anchor, $$props) {
	$.push($$props, true);

	function reset() {
		count.set(0);
	}

	var button = root();

	$.event('click', button, reset);
	$.append($$anchor, button);
	$.pop();
}