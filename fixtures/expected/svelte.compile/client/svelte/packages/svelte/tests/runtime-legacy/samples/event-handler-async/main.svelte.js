import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button>nothing</button>`);

export default function Main($$anchor) {
	var button = root();

	$.event('click', button, async () => {
		await null;
	});

	$.append($$anchor, button);
}