import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Cpu from "@lucide/svelte/icons/cpu";
import Lock from "@lucide/svelte/icons/lock";
import Sparkles from "@lucide/svelte/icons/sparkles";
import Zap from "@lucide/svelte/icons/zap";

var root = $.from_html(`<section class="overflow-hidden py-16 md:py-32"><div class="mx-auto max-w-5xl space-y-8 px-6 md:space-y-12"><div class="relative z-10 max-w-2xl"><h2 class="text-4xl font-semibold lg:text-5xl">Built for Scaling teams</h2> <p class="mt-6 text-lg">Empower your team with workflows that adapt to your needs, whether you prefer git
				synchronization or a AI Agents interface.</p></div> <div class="relative -mx-4 rounded-3xl p-3 md:-mx-12 lg:col-span-3"><div class="perspective-midrange"><div class="rotate-x-6 -skew-2"><div class="relative aspect-88/36"><div class="absolute -inset-17 z-1 bg-radial-[at_75%_25%] from-transparent to-background to-75%"></div> <img src="/mail-upper.png" class="absolute inset-0 z-10" alt="payments illustration dark"/> <img src="/mail-back.png" class="hidden dark:block" alt="payments illustration dark"/> <img src="/mail-back-light.png" class="dark:hidden" alt="payments illustration light"/></div></div></div></div> <div class="relative mx-auto grid grid-cols-2 gap-x-3 gap-y-6 sm:gap-8 lg:grid-cols-4"><div class="space-y-3"><div class="flex items-center gap-2"><!> <h3 class="text-sm font-medium">Faaast</h3></div> <p class="text-sm text-muted-foreground">It supports an entire helping developers and innovate.</p></div> <div class="space-y-2"><div class="flex items-center gap-2"><!> <h3 class="text-sm font-medium">Powerful</h3></div> <p class="text-sm text-muted-foreground">It supports an entire helping developers and businesses.</p></div> <div class="space-y-2"><div class="flex items-center gap-2"><!> <h3 class="text-sm font-medium">Security</h3></div> <p class="text-sm text-muted-foreground">It supports an helping developers businesses innovate.</p></div> <div class="space-y-2"><div class="flex items-center gap-2"><!> <h3 class="text-sm font-medium">AI Powered</h3></div> <p class="text-sm text-muted-foreground">It supports an helping developers businesses innovate.</p></div></div></div></section>`);

export default function Feature_seven($$anchor) {
	var section = root();
	var div = $.child(section);
	var div_1 = $.sibling($.child(div), 2);
	var div_2 = $.child(div_1);
	var div_3 = $.child(div_2);
	var div_4 = $.child(div_3);
	var img = $.sibling($.child(div_4), 2);

	$.set_attribute(img, 'width', 2797);
	$.set_attribute(img, 'height', 1137);

	var img_1 = $.sibling(img, 2);

	$.set_attribute(img_1, 'width', 2797);
	$.set_attribute(img_1, 'height', 1137);

	var img_2 = $.sibling(img_1, 2);

	$.set_attribute(img_2, 'width', 2797);
	$.set_attribute(img_2, 'height', 1137);
	$.reset(div_4);
	$.reset(div_3);
	$.reset(div_2);
	$.reset(div_1);

	var div_5 = $.sibling(div_1, 2);
	var div_6 = $.child(div_5);
	var div_7 = $.child(div_6);
	var node = $.child(div_7);

	Zap(node, { class: 'size-4' });
	$.next(2);
	$.reset(div_7);
	$.next(2);
	$.reset(div_6);

	var div_8 = $.sibling(div_6, 2);
	var div_9 = $.child(div_8);
	var node_1 = $.child(div_9);

	Cpu(node_1, { class: 'size-4' });
	$.next(2);
	$.reset(div_9);
	$.next(2);
	$.reset(div_8);

	var div_10 = $.sibling(div_8, 2);
	var div_11 = $.child(div_10);
	var node_2 = $.child(div_11);

	Lock(node_2, { class: 'size-4' });
	$.next(2);
	$.reset(div_11);
	$.next(2);
	$.reset(div_10);

	var div_12 = $.sibling(div_10, 2);
	var div_13 = $.child(div_12);
	var node_3 = $.child(div_13);

	Sparkles(node_3, { class: 'size-4' });
	$.next(2);
	$.reset(div_13);
	$.next(2);
	$.reset(div_12);
	$.reset(div_5);
	$.reset(div);
	$.reset(section);
	$.append($$anchor, section);
}