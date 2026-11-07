import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`TEXT <div class="dropdown"><label tabindex="0">Click</label> <ul tabindex="0"></ul></div>`, 1);

export default function Svelte_ignore02_input($$anchor) {
	$.next();

	var fragment = root();

	$.next();
	$.append($$anchor, fragment);
}