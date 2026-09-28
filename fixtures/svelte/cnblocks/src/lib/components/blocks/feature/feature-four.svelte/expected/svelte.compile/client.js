import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Cpu from "@lucide/svelte/icons/cpu";
import Fingerprint from "@lucide/svelte/icons/fingerprint";
import Pencil from "@lucide/svelte/icons/pencil";
import Settings2 from "@lucide/svelte/icons/settings-2";
import Sparkles from "@lucide/svelte/icons/sparkles";
import Zap from "@lucide/svelte/icons/zap";

var root = $.from_html(`<section class="py-12 md:py-20"><div class="mx-auto max-w-5xl space-y-8 px-6 md:space-y-16"><div class="relative z-10 mx-auto max-w-xl space-y-6 text-center md:space-y-12"><h2 class="text-4xl font-medium text-balance lg:text-5xl">The foundation for creative teams management</h2> <p>Lyra is evolving to be more than just the models. It supports an entire to the APIs
				and platforms helping developers and businesses innovate.</p></div> <div class="relative mx-auto grid max-w-4xl divide-x divide-y border *:p-12 sm:grid-cols-2 lg:grid-cols-3"><div class="space-y-3"><div class="flex items-center gap-2"><!> <h3 class="text-sm font-medium">Faaast</h3></div> <p class="text-sm">It supports an entire helping developers and innovate.</p></div> <div class="space-y-2"><div class="flex items-center gap-2"><!> <h3 class="text-sm font-medium">Powerful</h3></div> <p class="text-sm">It supports an entire helping developers and businesses.</p></div> <div class="space-y-2"><div class="flex items-center gap-2"><!> <h3 class="text-sm font-medium">Security</h3></div> <p class="text-sm">It supports an helping developers businesses.</p></div> <div class="space-y-2"><div class="flex items-center gap-2"><!> <h3 class="text-sm font-medium">Customization</h3></div> <p class="text-sm">It supports helping developers and businesses innovate.</p></div> <div class="space-y-2"><div class="flex items-center gap-2"><!> <h3 class="text-sm font-medium">Control</h3></div> <p class="text-sm">It supports helping developers and businesses innovate.</p></div> <div class="space-y-2"><div class="flex items-center gap-2"><!> <h3 class="text-sm font-medium">Built for AI</h3></div> <p class="text-sm">It supports helping developers and businesses innovate.</p></div></div></div></section>`);

export default function Feature_four($$anchor) {
	var section = root();
	var div = $.child(section);
	var div_1 = $.sibling($.child(div), 2);
	var div_2 = $.child(div_1);
	var div_3 = $.child(div_2);
	var node = $.child(div_3);

	Zap(node, { class: 'size-4' });
	$.next(2);
	$.reset(div_3);
	$.next(2);
	$.reset(div_2);

	var div_4 = $.sibling(div_2, 2);
	var div_5 = $.child(div_4);
	var node_1 = $.child(div_5);

	Cpu(node_1, { class: 'size-4' });
	$.next(2);
	$.reset(div_5);
	$.next(2);
	$.reset(div_4);

	var div_6 = $.sibling(div_4, 2);
	var div_7 = $.child(div_6);
	var node_2 = $.child(div_7);

	Fingerprint(node_2, { class: 'size-4' });
	$.next(2);
	$.reset(div_7);
	$.next(2);
	$.reset(div_6);

	var div_8 = $.sibling(div_6, 2);
	var div_9 = $.child(div_8);
	var node_3 = $.child(div_9);

	Pencil(node_3, { class: 'size-4' });
	$.next(2);
	$.reset(div_9);
	$.next(2);
	$.reset(div_8);

	var div_10 = $.sibling(div_8, 2);
	var div_11 = $.child(div_10);
	var node_4 = $.child(div_11);

	Settings2(node_4, { class: 'size-4' });
	$.next(2);
	$.reset(div_11);
	$.next(2);
	$.reset(div_10);

	var div_12 = $.sibling(div_10, 2);
	var div_13 = $.child(div_12);
	var node_5 = $.child(div_13);

	Sparkles(node_5, { class: 'size-4' });
	$.next(2);
	$.reset(div_13);
	$.next(2);
	$.reset(div_12);
	$.reset(div_1);
	$.reset(div);
	$.reset(section);
	$.append($$anchor, section);
}