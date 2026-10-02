import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { createEventDispatcher } from 'svelte';

var root = $.from_html(`<button>d</button>`);

export default function Input($$anchor, $$props) {
	$.push($$props, true);

	const dispatch = createEventDispatcher();

	dispatch('foo');

	var button = root();

	$.event('click', button, function ($$arg) {
		$.bubble_event.call(this, $$props, $$arg);
	});

	$.append($$anchor, button);
	$.pop();
}