import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<details class="svelte-1xdait1">Hello</details>`);

export default function Input($$anchor) {
	var details = root();

	$.append($$anchor, details);
}