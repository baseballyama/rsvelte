import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import GalleryVerticalEndIcon from "@lucide/svelte/icons/gallery-vertical-end";
import LoginForm from "./components/login-form.svelte";

var root = $.from_html(`<div class="grid min-h-svh lg:grid-cols-2"><div class="flex flex-col gap-4 p-6 md:p-10"><div class="flex justify-center gap-2 md:justify-start"><a href="##" class="flex items-center gap-2 font-medium"><div class="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground"><!></div> Acme Inc.</a></div> <div class="flex flex-1 items-center justify-center"><div class="w-full max-w-xs"><!></div></div></div> <div class="relative hidden bg-muted lg:block"><img src="/placeholder.svg" alt="placeholder" class="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"/></div></div>`);

export default function _page($$anchor) {
	var div = root();
	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var a = $.child(div_2);
	var div_3 = $.child(a);
	var node = $.child(div_3);

	GalleryVerticalEndIcon(node, { class: 'size-4' });
	$.reset(div_3);
	$.next();
	$.reset(a);
	$.reset(div_2);

	var div_4 = $.sibling(div_2, 2);
	var div_5 = $.child(div_4);
	var node_1 = $.child(div_5);

	LoginForm(node_1, {});
	$.reset(div_5);
	$.reset(div_4);
	$.reset(div_1);
	$.next(2);
	$.reset(div);
	$.append($$anchor, div);
}