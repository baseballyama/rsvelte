import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="svelte-logo svelte-zifevn"></div>`);

export default function SvelteLogo($$anchor) {
	var div = root();

	$.append($$anchor, div);
}