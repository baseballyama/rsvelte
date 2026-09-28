import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="a svelte-ibboeh"><span class="svelte-ibboeh"></span> <b class="svelte-ibboeh"></b></div> <article class="b svelte-ibboeh"></article>`, 1);

export default function Input($$anchor) {
	var fragment = root();

	$.next(2);
	$.append($$anchor, fragment);
}