import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { count } from './stores.js';

var root = $.from_html(`<button>+</button>`);

export default function Writable_stores03_input($$anchor, $$props) {
	$.push($$props, true);

	function increment() {
		count.update((n) => n + 1);
	}

	var button = root();

	$.event('click', button, increment);
	$.append($$anchor, button);
	$.pop();
}