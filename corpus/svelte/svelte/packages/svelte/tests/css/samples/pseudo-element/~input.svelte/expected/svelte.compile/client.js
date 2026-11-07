import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<span class="svelte-1ojjn5g"></span>`);

export default function Input($$anchor) {
	var span = root();

	$.append($$anchor, span);
}