import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button>del</button>`);

export default function Main($$anchor) {
	const arr = [0, 1, 2];
	var button = root();

	$.delegated('click', button, () => {
		delete arr[1];
		console.log(arr);
	});

	$.append($$anchor, button);
}

$.delegate(['click']);