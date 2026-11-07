import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p class="svelte-1a2g26r">This component is imported in multiple pages and therefore its CSS lands in a separate CSS chunk</p>`);

export default function SharedCSS($$anchor) {
	var p = root();

	$.append($$anchor, p);
}