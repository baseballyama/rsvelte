import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button></button>`);

export default function Main($$anchor) {
	let _ = "test";
	var button = root();

	$.delegated('click', button, () => {
		console.log(_);
	});

	$.append($$anchor, button);
}

$.delegate(['click']);