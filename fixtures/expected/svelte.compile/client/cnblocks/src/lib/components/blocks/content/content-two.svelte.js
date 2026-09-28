import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Zap from "@lucide/svelte/icons/zap";
import Cpu from "@lucide/svelte/icons/cpu";

var root = $.from_html(`<section class="py-16 md:py-32"><div class="mx-auto max-w-5xl space-y-8 px-6 md:space-y-16"><h2 class="relative z-10 max-w-xl text-4xl font-medium lg:text-5xl">The Lyra ecosystem brings together our models.</h2> <div class="relative"><div class="relative z-10 space-y-4 md:w-1/2"><p class="text-body">Lyra is evolving to be more than just the models. <span class="text-title font-medium">It supports an entire ecosystem</span> — from products innovate.</p> <p>It supports an entire ecosystem — from products to the APIs and platforms
					helping developers and businesses innovate</p> <div class="grid grid-cols-2 gap-3 pt-6 sm:gap-4"><div class="space-y-3"><div class="flex items-center gap-2"><!> <h3 class="text-sm font-medium">Faaast</h3></div> <p class="text-sm text-muted-foreground">It supports an entire helping developers and innovate.</p></div> <div class="space-y-2"><div class="flex items-center gap-2"><!> <h3 class="text-sm font-medium">Powerful</h3></div> <p class="text-sm text-muted-foreground">It supports an entire helping developers and businesses.</p></div></div></div> <div class="mt-12 h-fit md:absolute md:inset-x-0 md:-inset-y-12 md:mt-0"><div class="absolute inset-0 z-1 hidden bg-linear-to-l from-transparent to-background to-55% md:block"></div> <div class="relative rounded-2xl border border-dotted border-border/50 p-2"><img src="/charts.png" class="hidden rounded-[12px] dark:block" alt="payments illustration dark"/> <img src="/charts-light.png" class="rounded-[12px] shadow dark:hidden" alt="payments illustration light"/></div></div></div></div></section>`);

export default function Content_two($$anchor) {
	var section = root();
	var div = $.child(section);
	var div_1 = $.sibling($.child(div), 2);
	var div_2 = $.child(div_1);
	var div_3 = $.sibling($.child(div_2), 4);
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
	$.reset(div_3);
	$.reset(div_2);

	var div_8 = $.sibling(div_2, 2);
	var div_9 = $.sibling($.child(div_8), 2);
	var img = $.child(div_9);

	$.set_attribute(img, 'width', 1207);
	$.set_attribute(img, 'height', 929);

	var img_1 = $.sibling(img, 2);

	$.set_attribute(img_1, 'width', 1207);
	$.set_attribute(img_1, 'height', 929);
	$.reset(div_9);
	$.reset(div_8);
	$.reset(div_1);
	$.reset(div);
	$.reset(section);
	$.append($$anchor, section);
}