import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<h2 class="svelte-116557g">hello from component</h2>`);

export default function Component($$anchor) {
	var h2 = root();

	$.append($$anchor, h2);
}