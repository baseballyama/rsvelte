import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<h1 class="svelte-1jkhd2z">this should be purple</h1>`);

export default function _page($$anchor) {
	var h1 = root();

	$.append($$anchor, h1);
}