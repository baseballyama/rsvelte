import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import SignupForm from "./components/signup-form.svelte";

var root = $.from_html(`<div class="flex min-h-svh w-full items-center justify-center p-6 md:p-10"><div class="w-full max-w-sm"><!></div></div>`);

export default function _page($$anchor) {
	var div = root();
	var div_1 = $.child(div);
	var node = $.child(div_1);

	SignupForm(node, {});
	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, div);
}