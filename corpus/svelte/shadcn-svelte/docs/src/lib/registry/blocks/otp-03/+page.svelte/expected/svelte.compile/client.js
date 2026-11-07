import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import GalleryVerticalEndIcon from "@lucide/svelte/icons/gallery-vertical-end";
import OTPForm from "./components/otp-form.svelte";

var root = $.from_html(`<div class="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10"><div class="flex w-full max-w-xs flex-col gap-6"><a href="#/" class="flex items-center gap-2 self-center font-medium"><div class="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground"><!></div> Acme Inc.</a> <!></div></div>`);

export default function _page($$anchor) {
	var div = root();
	var div_1 = $.child(div);
	var a = $.child(div_1);
	var div_2 = $.child(a);
	var node = $.child(div_2);

	GalleryVerticalEndIcon(node, { class: 'size-4' });
	$.reset(div_2);
	$.next();
	$.reset(a);

	var node_1 = $.sibling(a, 2);

	OTPForm(node_1, {});
	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, div);
}