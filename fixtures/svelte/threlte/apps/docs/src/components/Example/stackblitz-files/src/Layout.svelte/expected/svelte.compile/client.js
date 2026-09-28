import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import App from './example/App.svelte';

var root = $.from_html(`<div class="svelte-1c50cix"><!></div>`);

export default function Layout($$anchor) {
	var div = root();
	var node = $.child(div);

	App(node, {});
	$.reset(div);
	$.append($$anchor, div);
}