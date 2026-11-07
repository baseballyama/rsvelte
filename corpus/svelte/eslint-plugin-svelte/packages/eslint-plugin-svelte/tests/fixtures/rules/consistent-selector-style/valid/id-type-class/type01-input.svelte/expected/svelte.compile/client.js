import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<a class="svelte-tqqwuz">Click me!</a> <a class="svelte-tqqwuz">Click me two!</a> <b class="svelte-tqqwuz">Text 1</b> <b class="svelte-tqqwuz">Text 2</b> <b data-key="val" class="svelte-tqqwuz">Text 2</b>`, 1);

export default function Type01_input($$anchor) {
	var fragment = root();

	$.next(8);
	$.append($$anchor, fragment);
}