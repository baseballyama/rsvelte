import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p type="b" class="svelte-twfzrl">blue</p>`);

export default function Input($$anchor) {
	var p = root();

	$.append($$anchor, p);
}