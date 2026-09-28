import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<main class="svelte-h8seo0"><div class="svelte-h8seo0"><button type="submit" class="svelte-h8seo0">Blue</button></div></main>`);

export default function Input($$anchor) {
	var main = root();

	$.append($$anchor, main);
}