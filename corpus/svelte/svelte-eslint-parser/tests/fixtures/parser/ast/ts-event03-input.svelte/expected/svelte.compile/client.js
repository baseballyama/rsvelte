import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { createEventDispatcher } from 'svelte';

var root = $.from_html(`<button></button> <input/>`, 1);

export default function Ts_event03_input($$anchor, $$props) {
	$.push($$props, true);

	const emit = createEventDispatcher();

	emit('foo', 1);

	var fragment = root();
	var button = $.first_child(fragment);
	var input = $.sibling(button, 2);

	$.event('click', button, (e) => {
		e.currentTarget;
	});

	$.event('input', input, (e) => {
		e.currentTarget;
	});

	$.append($$anchor, fragment);
	$.pop();
}