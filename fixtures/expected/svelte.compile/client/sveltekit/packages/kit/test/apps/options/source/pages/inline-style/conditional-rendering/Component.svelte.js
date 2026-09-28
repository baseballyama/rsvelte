import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p id="conditionally" class="svelte-1f61riy">This is conditionally rendered</p>`);

export default function Component($$anchor) {
	var p = root();

	$.append($$anchor, p);
}