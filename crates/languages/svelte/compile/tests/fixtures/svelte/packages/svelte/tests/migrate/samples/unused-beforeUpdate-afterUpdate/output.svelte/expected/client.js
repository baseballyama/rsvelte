import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button></button>`);

export default function Output($$anchor) {
	let count = $.state(0);
	var button = root();

	$.delegated('click', button, () => $.update(count));
	$.append($$anchor, button);
}

$.delegate(['click']);