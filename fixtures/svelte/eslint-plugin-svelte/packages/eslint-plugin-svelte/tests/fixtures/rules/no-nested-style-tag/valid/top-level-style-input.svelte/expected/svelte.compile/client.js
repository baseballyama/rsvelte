import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div><p class="svelte-8w1xvo">hello</p></div>`);

export default function Top_level_style_input($$anchor) {
	var div = root();

	$.append($$anchor, div);
}