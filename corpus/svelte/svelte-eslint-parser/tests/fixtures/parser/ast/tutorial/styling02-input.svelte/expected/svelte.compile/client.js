import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p class="svelte-ayjupy">This is a paragraph.</p>`);

export default function Styling02_input($$anchor) {
	var p = root();

	$.append($$anchor, p);
}