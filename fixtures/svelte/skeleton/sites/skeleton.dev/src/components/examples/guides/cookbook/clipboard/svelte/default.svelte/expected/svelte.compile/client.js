import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button class="btn preset-filled">Copy to Clipboard</button>`);

export default function Default($$anchor) {
	async function handleCopy() {
		const data = 'Hello World!';

		await navigator.clipboard.writeText(data);
		alert(`Copied "${data}" to clipboard!`);
	}

	var button = root();

	$.delegated('click', button, handleCopy);
	$.append($$anchor, button);
}

$.delegate(['click']);