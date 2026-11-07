import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import SharedCSS from '#lib/SharedCSS.svelte';
import '@fontsource/libre-barcode-128-text';

var root = $.from_html(
	`<p class="svelte-18xh00l">Test that the fontsource is referenced correctly, while the shared CSS in SharedCSS doesn't cause
	problems</p> <!>`,
	1
);

export default function _page($$anchor) {
	var fragment = root();
	var node = $.sibling($.first_child(fragment), 2);

	// @ts-ignore this is a vite font import so it has no side-effect types
	SharedCSS(node, {});

	$.append($$anchor, fragment);
}