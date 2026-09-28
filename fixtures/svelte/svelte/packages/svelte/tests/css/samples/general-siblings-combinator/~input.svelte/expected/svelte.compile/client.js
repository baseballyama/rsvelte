import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="a svelte-xap6i"><span class="svelte-xap6i"></span> <b class="svelte-xap6i"></b></div> <article class="b svelte-xap6i"></article> <p class="c svelte-xap6i"></p> <details class="d svelte-xap6i"></details>`, 1);

export default function Input($$anchor) {
	var fragment = root();

	$.next(6);
	$.append($$anchor, fragment);
}