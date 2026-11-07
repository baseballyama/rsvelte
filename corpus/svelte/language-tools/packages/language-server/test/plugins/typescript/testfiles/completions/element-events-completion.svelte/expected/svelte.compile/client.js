import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button></button>`);

export default function Element_events_completion($$anchor, $$props) {
	var button = root();

	$.event('tou', button, function ($$arg) {
		$.bubble_event.call(this, $$props, $$arg);
	});

	$.append($$anchor, button);
}