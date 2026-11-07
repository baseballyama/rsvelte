import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="a svelte-gussnq"><div class="a svelte-gussnq"></div> <div class="b svelte-gussnq"><div class="c svelte-gussnq"></div></div> <div class="d svelte-gussnq"></div></div> <div class="container svelte-gussnq"><div class="a svelte-gussnq"></div></div>`, 1);

export default function Input($$anchor) {
	var fragment = root();

	$.next(2);
	$.append($$anchor, fragment);
}