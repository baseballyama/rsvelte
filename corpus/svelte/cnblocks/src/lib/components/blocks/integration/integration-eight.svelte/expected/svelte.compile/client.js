import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Gemini, GooglePaLM, MagicUI, VSCodium, Replit, MediaWiki } from "../logos/logos";
import Button from "$lib/components/ui/button/button.svelte";

const IntergrationCardv8 = ($$anchor, $$arg0) => {
	let icon = () => ($$arg0?.()).icon;
	let name = () => ($$arg0?.()).name;
	let description = () => ($$arg0?.()).description;
	const Icon = $.derived(icon);
	var div = root();
	var div_1 = $.child(div);
	var node = $.child(div_1);

	$.component(node, () => $.get(Icon), ($$anchor, Icon_1) => {
		Icon_1($$anchor, {});
	});

	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var h3 = $.child(div_2);
	var text = $.only_child(h3, true);
	var p = $.sibling(h3, 2);
	var text_1 = $.only_child(p, true);

	$.reset(div_2);
	$.reset(div);

	$.template_effect(() => {
		$.set_text(text, name());
		$.set_text(text_1, description());
	});

	$.append($$anchor, div);
};

var root = $.from_html(`<div class="space-y-4 rounded-lg border p-4 transition-colors hover:bg-muted dark:hover:bg-muted/50"><div class="flex size-fit items-center justify-center"><!></div> <div class="space-y-1"><h3 class="text-sm font-medium"> </h3> <p class="line-clamp-1 text-sm text-muted-foreground md:line-clamp-2"> </p></div></div>`);

var root_1 = $.from_html(`<section><div class="bg-muted py-24 md:py-32 dark:bg-background"><div class="mx-auto flex flex-col px-6 md:grid md:max-w-5xl md:grid-cols-2 md:gap-12"><div class="order-last mt-6 flex flex-col gap-12 md:order-first"><div class="space-y-6"><h2 class="text-3xl font-semibold text-balance md:text-4xl lg:text-5xl">Integrate with your favorite LLMs</h2> <p class="text-muted-foreground">Connect seamlessly with popular platforms and services to enhance your
						workflow.</p> <!></div> <div class="mt-auto grid grid-cols-[auto_1fr] gap-3"><div class="flex aspect-square items-center justify-center border bg-background"><!></div> <blockquote><p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.</p> <div class="mt-2 flex gap-2 text-sm"><cite>John Doe</cite> <p class="text-muted-foreground">Founder, MediaWiki</p></div></blockquote></div></div> <div class="-mx-6 mask-[radial-gradient(ellipse_100%_100%_at_50%_0%,#000_70%,transparent_100%)] px-6 sm:mx-auto sm:max-w-md md:-mx-6 md:mr-0 md:ml-auto"><div class="rounded-2xl border bg-background p-3 shadow-lg md:pb-12 dark:bg-muted/50"><div class="grid grid-cols-2 gap-2"><!> <!> <!> <!> <!> <!></div></div></div></div></div></section>`);

export default function Integration_eight($$anchor) {
	var section = root_1();
	var div_3 = $.child(section);
	var div_4 = $.child(div_3);
	var div_5 = $.child(div_4);
	var div_6 = $.child(div_5);
	var node_1 = $.sibling($.child(div_6), 4);

	Button(node_1, {
		variant: 'outline',
		size: 'sm',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('Get started');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	$.reset(div_6);

	var div_7 = $.sibling(div_6, 2);
	var div_8 = $.child(div_7);
	var node_2 = $.child(div_8);

	MediaWiki(node_2, { class: 'size-9' });
	$.reset(div_8);
	$.next(2);
	$.reset(div_7);
	$.reset(div_5);

	var div_9 = $.sibling(div_5, 2);
	var div_10 = $.child(div_9);
	var div_11 = $.child(div_10);
	var node_3 = $.child(div_11);

	IntergrationCardv8(node_3, () => ({
		icon: Gemini,
		name: "Gemini",
		description: "The AI model that powers Google's search engine."
	}));

	var node_4 = $.sibling(node_3, 2);

	IntergrationCardv8(node_4, () => ({
		icon: Replit,
		name: "Replit",
		description: "The AI model that powers Google's search engine."
	}));

	var node_5 = $.sibling(node_4, 2);

	IntergrationCardv8(node_5, () => ({
		icon: GooglePaLM,
		name: "GooglePaLM",
		description: "The AI model that powers Google's search engine."
	}));

	var node_6 = $.sibling(node_5, 2);

	IntergrationCardv8(node_6, () => ({
		icon: MagicUI,
		name: "MagicUI",
		description: "The AI model that powers Google's search engine."
	}));

	var node_7 = $.sibling(node_6, 2);

	IntergrationCardv8(node_7, () => ({
		icon: VSCodium,
		name: "VSCodium",
		description: "The AI model that powers Google's search engine."
	}));

	var node_8 = $.sibling(node_7, 2);

	IntergrationCardv8(node_8, () => ({
		icon: MediaWiki,
		name: "MediaWiki",
		description: "The AI model that powers Google's search engine."
	}));

	$.reset(div_11);
	$.reset(div_10);
	$.reset(div_9);
	$.reset(div_4);
	$.reset(div_3);
	$.reset(section);
	$.append($$anchor, section);
}