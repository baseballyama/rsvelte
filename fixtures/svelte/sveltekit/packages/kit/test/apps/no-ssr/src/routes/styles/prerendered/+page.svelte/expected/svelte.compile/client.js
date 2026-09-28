import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p class="svelte-1hzh7qq">I should be red</p>`);

export default function _page($$anchor) {
	var p = root();

	$.append($$anchor, p);
}