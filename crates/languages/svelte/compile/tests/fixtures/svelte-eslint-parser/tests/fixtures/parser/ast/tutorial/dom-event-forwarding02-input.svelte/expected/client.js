import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button class="svelte-1tplpqf">Click me</button>`);

export default function Dom_event_forwarding02_input($$anchor, $$props) {
	var button = root();

	$.event('click', button, function ($$arg) {
		$.bubble_event.call(this, $$props, $$arg);
	});

	$.append($$anchor, button);
}