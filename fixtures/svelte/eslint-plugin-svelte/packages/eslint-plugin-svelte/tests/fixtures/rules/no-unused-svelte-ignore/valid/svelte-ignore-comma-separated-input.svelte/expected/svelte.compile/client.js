import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="dropdown"><label tabindex="0">Click</label> <ul tabindex="0"></ul></div>`);

export default function Svelte_ignore_comma_separated_input($$anchor) {
	var div = root();

	$.append($$anchor, div);
}