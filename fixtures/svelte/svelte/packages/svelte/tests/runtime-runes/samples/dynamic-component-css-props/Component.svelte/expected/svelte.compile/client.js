import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="svelte-1nkl8wr">Hello</div>`);

export default function Component($$anchor) {
	var div = root();

	$.append($$anchor, div);
}