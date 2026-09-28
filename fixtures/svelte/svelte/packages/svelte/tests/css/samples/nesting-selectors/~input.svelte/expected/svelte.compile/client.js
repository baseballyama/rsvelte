import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<header class="svelte-15ya87e"><nav class="active svelte-15ya87e"></nav></header>`);

export default function Input($$anchor) {
	var header = root();

	$.append($$anchor, header);
}