import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<a class="svelte-1l0717m"><b class="svelte-1l0717m"><c class="svelte-1l0717m"><span class="svelte-1l0717m">Big red Comic Sans</span> <span class="foo svelte-1l0717m">Big red Comic Sans</span></c></b></a>`);

export default function Input($$anchor) {
	var a = root();

	$.append($$anchor, a);
}