import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button></button>`);

export default function Array01_input($$anchor) {
	const a = 'hello!';
	var button = root();

	$.delegated('click', button, function (...$$args) {
		[a]?.apply(this, $$args);
	});

	$.append($$anchor, button);
}

$.delegate(['click']);