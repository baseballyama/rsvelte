import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { createEventDispatcher } from 'svelte';

var root = $.from_html(`<button>Click to say hello</button>`);

export default function Component_events02_input($$anchor, $$props) {
	$.push($$props, true);

	const dispatch = createEventDispatcher();

	function sayHello() {
		dispatch('message', { text: 'Hello!' });
	}

	var button = root();

	$.event('click', button, sayHello);
	$.append($$anchor, button);
	$.pop();
}