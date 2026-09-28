import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import OTPForm from "./components/otp-form.svelte";

var root = $.from_html(`<div class="flex min-h-svh w-full"><div class="flex w-full items-center justify-center p-6 lg:w-1/2"><div class="w-full max-w-xs"><!></div></div> <div class="relative hidden w-1/2 lg:block"><img alt="Authentication" class="absolute inset-0 h-full w-full object-cover" src="/placeholder.svg"/></div></div>`);

export default function _page($$anchor) {
	var div = root();
	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var node = $.child(div_2);

	OTPForm(node, {});
	$.reset(div_2);
	$.reset(div_1);

	var div_3 = $.sibling(div_1, 2);
	var img = $.child(div_3);

	$.set_attribute(img, 'height', 1080);
	$.set_attribute(img, 'width', 1920);
	$.reset(div_3);
	$.reset(div);
	$.append($$anchor, div);
}