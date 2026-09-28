import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { createEventDispatcher } from 'svelte';

var root = $.from_html(`<button>click me</button>`);

export default function Widget($$anchor, $$props) {
	$.push($$props, true);

	const dispatch = createEventDispatcher();
	var button = root();

	$.event('click', button, () => dispatch("foo"));
	$.append($$anchor, button);
	$.pop();
}