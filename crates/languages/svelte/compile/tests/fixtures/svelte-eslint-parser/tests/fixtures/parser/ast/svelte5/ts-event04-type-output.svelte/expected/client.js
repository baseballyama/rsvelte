import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button></button>`);

export default function Ts_event04_type_output($$anchor) {
	var button = root();

	$.event('unknown', button, (e) => {
		// e: CustomEvent<any>
		e.currentTarget; // e.currentTarget: EventTarget | null
	});

	$.append($$anchor, button);
}