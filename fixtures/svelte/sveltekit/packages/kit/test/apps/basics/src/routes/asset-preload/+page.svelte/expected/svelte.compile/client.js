import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import './styles.css';

var root = $.from_html(`<h1 class="svelte-mqox88">asset-preload</h1>`);

export default function _page($$anchor) {
	var h1 = root();

	$.append($$anchor, h1);
}