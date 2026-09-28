import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import OTPForm from "./components/otp-form.svelte";

var root = $.from_html(`<div class="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10"><div class="w-full max-w-sm"><!></div></div>`);

export default function _page($$anchor) {
	var div = root();
	var div_1 = $.child(div);
	var node = $.child(div_1);

	OTPForm(node, {});
	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, div);
}