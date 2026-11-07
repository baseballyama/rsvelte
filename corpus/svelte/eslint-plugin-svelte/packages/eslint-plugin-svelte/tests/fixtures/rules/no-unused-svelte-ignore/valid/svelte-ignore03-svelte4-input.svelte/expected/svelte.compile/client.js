import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="dropdown"><label tabindex="0">Click</label> <ul tabindex="0"></ul></div>  <div class="dropdown"><label tabindex="0">Click</label> <ul tabindex="0"></ul></div>`, 1);

export default function Svelte_ignore03_svelte4_input($$anchor) {
	var fragment = root();

	$.next(2);
	$.append($$anchor, fragment);
}