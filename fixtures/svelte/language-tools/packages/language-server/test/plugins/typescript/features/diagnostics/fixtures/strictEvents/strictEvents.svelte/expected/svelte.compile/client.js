import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { createEventDispatcher } from 'svelte';

var root = $.from_html(`<button>click</button>`);

export default function StrictEvents($$anchor, $$props) {
	$.push($$props, true);

	const dispatch = createEventDispatcher();

	dispatch('foo', 'bar');

	var button = root();

	$.event('click', button, function ($$arg) {
		$.bubble_event.call(this, $$props, $$arg);
	});

	$.append($$anchor, button);
	$.pop();
}