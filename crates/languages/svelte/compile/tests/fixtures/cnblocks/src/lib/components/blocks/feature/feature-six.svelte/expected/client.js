import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Cpu from "@lucide/svelte/icons/cpu";
import Lock from "@lucide/svelte/icons/lock";
import Sparkles from "@lucide/svelte/icons/sparkles";
import Zap from "@lucide/svelte/icons/zap";

var root = $.from_html(`<section class="py-16 md:py-32"><div class="mx-auto max-w-5xl space-y-12 px-6"><div class="relative z-10 grid items-center gap-4 md:grid-cols-2 md:gap-12"><h2 class="text-4xl font-semibold">The Lyra ecosystem brings together our models</h2> <p class="max-w-sm sm:ml-auto">Empower your team with workflows that adapt to your needs, whether you prefer git
				synchronization or a AI Agents interface.</p></div> <div class="relative rounded-3xl p-3 md:-mx-8 lg:col-span-3"><div class="relative aspect-88/36"><div class="absolute inset-0 z-1 bg-linear-to-t from-background to-transparent"></div> <img src="/mail-upper.png" class="absolute inset-0 z-10" alt="payments illustration dark"/> <img src="/mail-back.png" class="hidden dark:block" alt="payments illustration dark"/> <img src="/mail-back-light.png" class="dark:hidden" alt="payments illustration light"/></div></div> <div class="relative mx-auto grid grid-cols-2 gap-x-3 gap-y-6 sm:gap-8 lg:grid-cols-4"><div class="space-y-3"><div class="flex items-center gap-2"><!> <h3 class="text-sm font-medium">Faaast</h3></div> <p class="text-sm text-muted-foreground">It supports an entire helping developers and innovate.</p></div> <div class="space-y-2"><div class="flex items-center gap-2"><!> <h3 class="text-sm font-medium">Powerful</h3></div> <p class="text-sm text-muted-foreground">It supports an entire helping developers and businesses.</p></div> <div class="space-y-2"><div class="flex items-center gap-2"><!> <h3 class="text-sm font-medium">Security</h3></div> <p class="text-sm text-muted-foreground">It supports an helping developers businesses innovate.</p></div> <div class="space-y-2"><div class="flex items-center gap-2"><!> <h3 class="text-sm font-medium">AI Powered</h3></div> <p class="text-sm text-muted-foreground">It supports an helping developers businesses innovate.</p></div></div></div></section>`);

export default function Feature_six($$anchor) {
	var section = root();
	var div = $.child(section);
	var div_1 = $.sibling($.child(div), 2);
	var div_2 = $.child(div_1);
	var img = $.sibling($.child(div_2), 2);

	$.set_attribute(img, 'width', 2797);
	$.set_attribute(img, 'height', 1137);

	var img_1 = $.sibling(img, 2);

	$.set_attribute(img_1, 'width', 2797);
	$.set_attribute(img_1, 'height', 1137);

	var img_2 = $.sibling(img_1, 2);

	$.set_attribute(img_2, 'width', 2797);
	$.set_attribute(img_2, 'height', 1137);
	$.reset(div_2);
	$.reset(div_1);

	var div_3 = $.sibling(div_1, 2);
	var div_4 = $.child(div_3);
	var div_5 = $.child(div_4);
	var node = $.child(div_5);

	Zap(node, { class: 'size-4' });
	$.next(2);
	$.reset(div_5);
	$.next(2);
	$.reset(div_4);

	var div_6 = $.sibling(div_4, 2);
	var div_7 = $.child(div_6);
	var node_1 = $.child(div_7);

	Cpu(node_1, { class: 'size-4' });
	$.next(2);
	$.reset(div_7);
	$.next(2);
	$.reset(div_6);

	var div_8 = $.sibling(div_6, 2);
	var div_9 = $.child(div_8);
	var node_2 = $.child(div_9);

	Lock(node_2, { class: 'size-4' });
	$.next(2);
	$.reset(div_9);
	$.next(2);
	$.reset(div_8);

	var div_10 = $.sibling(div_8, 2);
	var div_11 = $.child(div_10);
	var node_3 = $.child(div_11);

	Sparkles(node_3, { class: 'size-4' });
	$.next(2);
	$.reset(div_11);
	$.next(2);
	$.reset(div_10);
	$.reset(div_3);
	$.reset(div);
	$.reset(section);
	$.append($$anchor, section);
}