import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import HeaderFour from "$lib/components/veil/header/header-four.svelte";
import { Button } from "$lib/components/ui/veil/button";
import AudioLines from "@lucide/svelte/icons/audio-lines";
import ChevronRight from "@lucide/svelte/icons/chevron-right";
import ImageIcon from "@lucide/svelte/icons/image";
import Lightbulb from "@lucide/svelte/icons/lightbulb";
import Mic2 from "@lucide/svelte/icons/mic-2";
import Paperclip from "@lucide/svelte/icons/paperclip";
import Plus from "@lucide/svelte/icons/plus";
import ShoppingBag from "@lucide/svelte/icons/shopping-bag";
import Telescope from "@lucide/svelte/icons/telescope";
import Github from "$lib/components/logos/github.svelte";

var root = $.from_html(`Start Building <!>`, 1);
var root_1 = $.from_html(`<!> <main class="overflow-hidden"><section class="bg-background"><div class="relative py-32"><div class="absolute inset-0 aspect-2/3 mask-t-from-50% mask-radial-[75%_100%] mask-radial-from-45% mask-radial-to-75% mask-radial-at-top md:aspect-square lg:aspect-9/4 dark:opacity-5"><img src="https://images.unsplash.com/photo-1740516367177-ae20098c8786?q=80&amp;w=2268&amp;auto=format&amp;fit=crop&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="hero background" width="2268" height="1740" class="h-full w-full object-cover object-top"/></div> <div class="relative z-10 mx-auto w-full max-w-5xl px-6"><div class="mb-6 ml-auto max-w-3xl min-w-2xl scale-90 mask-radial-[75%_100%] mask-radial-from-65% mask-radial-to-90% mask-radial-at-left py-12 pl-6 perspective-near sm:mb-12 md:pl-12 lg:mb-20"><div class="relative flex h-56 -rotate-12 rotate-x-12 rotate-y-2 rotate-z-10 flex-col rounded-3xl border bg-muted py-4 pl-4"><div class="absolute bottom-15 left-4 min-w-56 rounded-2xl bg-card p-1 shadow-xl ring-1 shadow-foreground/10 ring-border dark:shadow-black/25"><div class="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-sm hover:bg-muted [&amp;>svg]:size-4 [&amp;>svg]:opacity-65"><!> <span>Add photos and files</span></div> <span class="mx-3 my-0.5 block h-px bg-[linear-gradient(90deg,var(--color-foreground)_1px,transparent_1px)] bg-size-[6px_1px] bg-bottom bg-repeat-x opacity-30 dark:opacity-15"></span> <div class="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-sm hover:bg-muted [&amp;>svg]:size-4 [&amp;>svg]:opacity-65"><!> <span>Create image</span></div> <div class="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-sm hover:bg-muted [&amp;>svg]:size-4 [&amp;>svg]:opacity-65"><!> <span>Thinking</span></div> <div class="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-sm hover:bg-muted [&amp;>svg]:size-4 [&amp;>svg]:opacity-65"><!> <span>Deep research</span></div> <div class="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-sm hover:bg-muted [&amp;>svg]:size-4 [&amp;>svg]:opacity-65"><!> <span>Shopping research</span></div> <div class="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-sm hover:bg-muted [&amp;>svg]:size-4 [&amp;>svg]:opacity-65"><!> <span>Open source access</span></div></div> <div class="mt-auto flex h-fit justify-between gap-3 rounded-full bg-card p-2 shadow-xs ring-1 shadow-foreground/6.5 ring-border dark:shadow-black/6.5"><div class="flex items-center gap-2"><div class="flex size-9 cursor-pointer rounded-full bg-muted *:m-auto *:size-4"><!></div> <div class="text-sm text-muted-foreground">Ask anything...</div></div> <div class="flex items-center gap-0.5"><div class="flex size-9 cursor-pointer rounded-full *:m-auto *:size-4 hover:bg-muted"><!></div> <div class="flex size-9 cursor-pointer rounded-full bg-foreground text-background *:m-auto *:size-4 hover:brightness-110"><!></div></div></div></div></div> <div class="mx-auto max-w-md text-center"><h1 class="font-serif text-4xl font-medium text-balance sm:text-5xl">Ship faster. Integrate smarter.</h1> <p class="mt-4 text-balance text-muted-foreground">Veil is your all-in-one engine for adding seamless integrations to your app.</p> <!></div></div></div></section></main>`, 1);

export default function Hero_four($$anchor) {
	var fragment = root_1();
	var node = $.first_child(fragment);

	HeaderFour(node, {});

	var main = $.sibling(node, 2);
	var section = $.child(main);
	var div = $.child(section);
	var div_1 = $.sibling($.child(div), 2);
	var div_2 = $.child(div_1);

	$.set_attribute(div_2, 'aria-hidden', true);

	var div_3 = $.child(div_2);
	var div_4 = $.child(div_3);
	var div_5 = $.child(div_4);
	var node_1 = $.child(div_5);

	Paperclip(node_1, {});
	$.next(2);
	$.reset(div_5);

	var div_6 = $.sibling(div_5, 4);
	var node_2 = $.child(div_6);

	ImageIcon(node_2, {});
	$.next(2);
	$.reset(div_6);

	var div_7 = $.sibling(div_6, 2);
	var node_3 = $.child(div_7);

	Lightbulb(node_3, {});
	$.next(2);
	$.reset(div_7);

	var div_8 = $.sibling(div_7, 2);
	var node_4 = $.child(div_8);

	Telescope(node_4, {});
	$.next(2);
	$.reset(div_8);

	var div_9 = $.sibling(div_8, 2);
	var node_5 = $.child(div_9);

	ShoppingBag(node_5, {});
	$.next(2);
	$.reset(div_9);

	var div_10 = $.sibling(div_9, 2);
	var node_6 = $.child(div_10);

	Github(node_6, {});
	$.next(2);
	$.reset(div_10);
	$.reset(div_4);

	var div_11 = $.sibling(div_4, 2);
	var div_12 = $.child(div_11);
	var div_13 = $.child(div_12);
	var node_7 = $.child(div_13);

	Plus(node_7, {});
	$.reset(div_13);
	$.next(2);
	$.reset(div_12);

	var div_14 = $.sibling(div_12, 2);
	var div_15 = $.child(div_14);
	var node_8 = $.child(div_15);

	Mic2(node_8, {});
	$.reset(div_15);

	var div_16 = $.sibling(div_15, 2);
	var node_9 = $.child(div_16);

	AudioLines(node_9, {});
	$.reset(div_16);
	$.reset(div_14);
	$.reset(div_11);
	$.reset(div_3);
	$.reset(div_2);

	var div_17 = $.sibling(div_2, 2);
	var node_10 = $.sibling($.child(div_17), 4);

	Button(node_10, {
		class: 'mt-6 pr-1.5',
		href: '#link',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var fragment_1 = root();
			var node_11 = $.sibling($.first_child(fragment_1));

			ChevronRight(node_11, { class: 'opacity-50' });
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.reset(div_17);
	$.reset(div_1);
	$.reset(div);
	$.reset(section);
	$.reset(main);
	$.append($$anchor, fragment);
}