import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button type="button">Button</button>`);

export default function Main($$anchor) {
	var button = root();

	$.delegated('click', button, async () => {
		await Promise.resolve();
	});

	$.append($$anchor, button);
}

$.delegate(['click']);