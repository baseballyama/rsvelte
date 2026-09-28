import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<hr class="svelte-kl1ok6"/>`);

export default function Separator($$anchor) {
	var hr = root();

	$.append($$anchor, hr);
}