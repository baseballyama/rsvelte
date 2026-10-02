import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button></button>`);

export default function Ts_event04_input($$anchor) {
	var button = root();

	$.event('unknown', button, (e) => {
		e.currentTarget;
	});

	$.append($$anchor, button);
}