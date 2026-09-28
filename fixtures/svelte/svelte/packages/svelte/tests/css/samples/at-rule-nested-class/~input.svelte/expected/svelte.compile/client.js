import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="card svelte-jt4w68"></div>`);

export default function Input($$anchor) {
	var div = root();

	$.append($$anchor, div);
}