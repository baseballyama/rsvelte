import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import HeaderThree from "$lib/components/veil/header/header-three.svelte";
import { Button } from "$lib/components/ui/veil/button";
import AudioLines from "@lucide/svelte/icons/audio-lines";
import ChevronRight from "@lucide/svelte/icons/chevron-right";
import MessageCircle from "@lucide/svelte/icons/message-circle";
import Mic2 from "@lucide/svelte/icons/mic-2";
import Plus from "@lucide/svelte/icons/plus";

var root = $.from_html(`Start Building <!>`, 1);
var root_1 = $.from_html(`<div class="flex items-center gap-2 px-14 py-2 text-sm text-muted-foreground"><!> <span class="text-nowrap"> </span></div>`);

var root_2 = $.from_html(
	`<!> <main class="overflow-hidden"><section class="bg-background"><div class="relative py-40"><div class="absolute inset-0 aspect-2/3 mask-radial-[75%_100%] mask-radial-from-45% mask-radial-to-75% mask-radial-at-top opacity-75 blur-xl md:aspect-square lg:aspect-video dark:opacity-5"><img src="https://images.unsplash.com/photo-1685013640715-8701bbaa2207?q=80&amp;w=2198&amp;auto=format&amp;fit=crop&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="hero background" width="2198" height="1685" class="h-full w-full object-cover object-top"/></div> <div class="relative z-10 mx-auto w-full max-w-5xl sm:pl-6"><div class="flex items-center justify-between max-md:flex-col"><div class="max-w-md max-sm:px-6"><h1 class="font-serif text-4xl font-medium text-balance sm:text-5xl">Ship faster. Integrate smarter.</h1> <p class="mt-4 text-balance text-muted-foreground">Veil is your all-in-one engine for adding seamless integrations to your
							app.</p> <!></div> <div class="relative mask-y-from-50% max-md:mx-auto max-md:*:scale-90"><!> <div class="absolute inset-0 m-auto mt-auto flex h-fit min-w-sm justify-between gap-3 rounded-full bg-card p-2 shadow-xl ring-1 shadow-foreground/6.5 ring-border sm:inset-2 dark:shadow-black/6.5"><div class="flex items-center gap-2"><div class="flex size-9 cursor-pointer rounded-full *:m-auto *:size-4 hover:bg-muted"><!></div> <div class="text-sm text-muted-foreground">Ask anything...</div></div> <div class="flex items-center gap-0.5"><div class="flex size-9 cursor-pointer rounded-full *:m-auto *:size-4 hover:bg-muted"><!></div> <div class="flex size-9 cursor-pointer rounded-full bg-foreground text-background *:m-auto *:size-4 hover:brightness-110"><!></div></div></div></div></div></div></div></section></main>`,
	1
);

export default function Hero_three($$anchor) {
	const prompts = [
		"How do I integrate Supabase authentication?",
		"Set up real-time subscriptions with Firebase",
		"Connect Slack notifications to my app",
		"Implement Twilio SMS verification",
		"Add Linear issue tracking integration",
		"Set up Figma design sync",
		"Deploy to Vercel with environment variables",
		"Configure Clerk user management",
		"Build an AI assistant with Claude",
		"Create a webhook endpoint for Stripe",
		"Set up OAuth with multiple providers",
		"Implement rate limiting for API endpoints"
	];

	var fragment = root_2();
	var node = $.first_child(fragment);

	HeaderThree(node, {});

	var main = $.sibling(node, 2);
	var section = $.child(main);
	var div = $.child(section);
	var div_1 = $.sibling($.child(div), 2);
	var div_2 = $.child(div_1);
	var div_3 = $.child(div_2);
	var node_1 = $.sibling($.child(div_3), 4);

	Button(node_1, {
		class: 'mt-6 pr-1.5',
		href: '#link',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var fragment_1 = root();
			var node_2 = $.sibling($.first_child(fragment_1));

			ChevronRight(node_2, { class: 'opacity-50' });
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.reset(div_3);

	var div_4 = $.sibling(div_3, 2);

	$.set_attribute(div_4, 'aria-hidden', true);

	var node_3 = $.child(div_4);

	$.each(node_3, 17, () => prompts, $.index, ($$anchor, prompt) => {
		var div_5 = root_1();
		var node_4 = $.child(div_5);

		MessageCircle(node_4, { class: 'size-3.5 opacity-50' });

		var span = $.sibling(node_4, 2);
		var text = $.only_child(span, true);

		$.reset(div_5);
		$.template_effect(() => $.set_text(text, $.get(prompt)));
		$.append($$anchor, div_5);
	});

	var div_6 = $.sibling(node_3, 2);
	var div_7 = $.child(div_6);
	var div_8 = $.child(div_7);
	var node_5 = $.child(div_8);

	Plus(node_5, {});
	$.reset(div_8);
	$.next(2);
	$.reset(div_7);

	var div_9 = $.sibling(div_7, 2);
	var div_10 = $.child(div_9);
	var node_6 = $.child(div_10);

	Mic2(node_6, {});
	$.reset(div_10);

	var div_11 = $.sibling(div_10, 2);
	var node_7 = $.child(div_11);

	AudioLines(node_7, {});
	$.reset(div_11);
	$.reset(div_9);
	$.reset(div_6);
	$.reset(div_4);
	$.reset(div_2);
	$.reset(div_1);
	$.reset(div);
	$.reset(section);
	$.reset(main);
	$.append($$anchor, fragment);
}