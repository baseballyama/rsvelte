import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button>Increment</button>`);

export default function Sub($$anchor, $$props) {
	var button = root();

	$.event('click', button, function (...$$args) {
		$$props.onClick?.apply(this, $$args);
	});

	$.append($$anchor, button);
}