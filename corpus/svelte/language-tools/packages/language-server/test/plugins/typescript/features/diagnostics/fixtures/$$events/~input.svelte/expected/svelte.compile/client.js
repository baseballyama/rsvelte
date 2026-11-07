import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { createEventDispatcher } from 'svelte';

var root = $.from_html(`<button>click</button>`);

export default function Input($$anchor, $$props) {
	$.push($$props, true);

	const dispatch = createEventDispatcher();

	// valid
	dispatch('foo', 'bar');

	// invalid
	dispatch('foo', true);

	dispatch('click', '');

	var button = root();

	$.event('click', button, function ($$arg) {
		$.bubble_event.call(this, $$props, $$arg);
	});

	$.append($$anchor, button);
	$.pop();
}