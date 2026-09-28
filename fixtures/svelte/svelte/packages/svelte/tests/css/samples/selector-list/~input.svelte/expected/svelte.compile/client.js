import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="svelte-1yoqzjx"><span class="svelte-1yoqzjx">text</span> <div class="svelte-1yoqzjx">text</div></div>`);

export default function Input($$anchor) {
	var div = root();

	$.append($$anchor, div);
}