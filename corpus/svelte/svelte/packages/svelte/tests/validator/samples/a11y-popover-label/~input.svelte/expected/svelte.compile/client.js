import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button interestfor="my-hint"><div id="my-hint" popover="hint">hello</div></button>`);

export default function Input($$anchor) {
	var button = root();

	$.append($$anchor, button);
}