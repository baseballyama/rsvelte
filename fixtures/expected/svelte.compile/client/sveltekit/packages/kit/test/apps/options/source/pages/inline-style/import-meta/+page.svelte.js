import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="svelte-69orrv">this page is being imported so its css is associated with a separate chunk</div>`);

export default function _page($$anchor) {
	var div = root();

	$.append($$anchor, div);
}