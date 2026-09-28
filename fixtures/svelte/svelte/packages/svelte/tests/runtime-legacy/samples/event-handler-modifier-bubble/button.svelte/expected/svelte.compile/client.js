import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button>click me</button>`);

export default function Button($$anchor, $$props) {
	var button = root();

	$.event('click', button, $.preventDefault(function ($$arg) {
		$.bubble_event.call(this, $$props, $$arg);
	}));

	$.append($$anchor, button);
}