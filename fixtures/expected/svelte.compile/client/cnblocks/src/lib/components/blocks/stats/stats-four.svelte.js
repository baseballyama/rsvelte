import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Spotify } from "$lib/svgs";

var root = $.from_html(`<section class="py-16 md:py-32"><div class="mx-auto max-w-5xl space-y-8 px-6 md:space-y-12"><div class="relative z-10 max-w-xl space-y-6"><h2 class="text-4xl font-medium lg:text-5xl">The Gemini ecosystem brings together our models.</h2> <p>Gemini is evolving to be more than just the models. <span class="font-medium">It supports an entire ecosystem</span> — from products innovate.</p></div> <div class="grid gap-6 sm:grid-cols-2 md:gap-12 lg:gap-24"><div><p>It supports an entire ecosystem — from products to the APIs and platforms
					helping developers and businesses innovate</p> <div class="mt-12 mb-12 grid grid-cols-2 gap-2 md:mb-0"><div class="space-y-4"><div class="bg-linear-to-r from-zinc-950 to-zinc-600 bg-clip-text text-5xl font-bold text-transparent dark:from-white dark:to-zinc-800">+1200</div> <p>Stars on GitHub</p></div> <div class="space-y-4"><div class="bg-linear-to-r from-zinc-950 to-zinc-600 bg-clip-text text-5xl font-bold text-transparent dark:from-white dark:to-zinc-800">+500</div> <p>Powered Apps</p></div></div></div> <div class="relative"><blockquote class="border-l-4 pl-4"><p>Using TailsUI has been like unlocking a secret design superpower. It's the
						perfect fusion of simplicity and versatility, enabling us to create UIs that
						are as stunning as they are user-friendly.</p> <div class="mt-6 space-y-3"><cite class="block font-medium">John Doe, CEO</cite> <!></div></blockquote></div></div></div></section>`);

export default function Stats_four($$anchor) {
	var section = root();
	var div = $.child(section);
	var div_1 = $.sibling($.child(div), 2);
	var div_2 = $.sibling($.child(div_1), 2);
	var blockquote = $.child(div_2);
	var div_3 = $.sibling($.child(blockquote), 2);
	var node = $.sibling($.child(div_3), 2);

	Spotify(node, { class: 'h-5 w-fit dark:invert' });
	$.reset(div_3);
	$.reset(blockquote);
	$.reset(div_2);
	$.reset(div_1);
	$.reset(div);
	$.reset(section);
	$.append($$anchor, section);
}