import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import LoginForm from "./components/login-form.svelte";

var root = $.from_html(`<div class="flex h-screen w-full items-center justify-center px-4"><!></div>`);

export default function _page($$anchor) {
	var div = root();
	var node = $.child(div);

	LoginForm(node, {});
	$.reset(div);
	$.append($$anchor, div);
}