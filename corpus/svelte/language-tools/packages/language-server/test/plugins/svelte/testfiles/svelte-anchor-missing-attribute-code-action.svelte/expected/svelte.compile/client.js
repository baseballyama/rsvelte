import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<a href="https://svelte.dev" target="_blank">Svelte</a>`);

export default function Svelte_anchor_missing_attribute_code_action($$anchor) {
	var a = root();

	$.append($$anchor, a);
}