import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p class="svelte-1ek8nao">testing if we correctly fix the asset URL in the CSS if it has URL encoded characters</p>`);

export default function _page($$anchor) {
	var p = root();

	$.append($$anchor, p);
}