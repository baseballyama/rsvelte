import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button>Help</button>`);

export default function HelpButtonComponent($$anchor) {
	var button = root();

	$.event('click', button, () => alert("Read the svelte-table docs: https://github.com/dasDaniel/svelte-table"));
	$.append($$anchor, button);
}