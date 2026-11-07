import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Gemini, GooglePaLM, Replit } from "../logos/logos";
import Button from "$lib/components/ui/button/button.svelte";
import Plus from "@lucide/svelte/icons/plus";

const IntegrationCardv6 = ($$anchor, $$arg0) => {
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

	var node_1 = $.sibling(div_2, 2);

	Button(node_1, {
		variant: 'outline',
		size: 'icon',
		'aria-label': 'Add integration',
		children: ($$anchor, $$slotProps) => {
			Plus($$anchor, { class: 'size-4' });
		},
		$$slots: { default: true }
	});

	$.reset(div);

	$.template_effect(() => {
		$.set_text(text, name());
		$.set_text(text_1, description());
	});

	$.append($$anchor, div);
};

var root = $.from_html(`<div class="grid grid-cols-[auto_1fr_auto] items-center gap-3 border-b border-dashed py-3 last:border-b-0"><div class="flex size-12 items-center justify-center rounded-lg border border-foreground/5 bg-muted"><!></div> <div class="space-y-0.5"><h3 class="text-sm font-medium"> </h3> <p class="line-clamp-1 text-sm text-muted-foreground"> </p></div> <!></div>`);
var root_1 = $.from_html(`<section><div class="bg-muted py-24 md:py-32 dark:bg-background"><div class="mx-auto max-w-5xl px-6"><div class="mx-auto max-w-md mask-[radial-gradient(ellipse_100%_100%_at_50%_0%,#000_70%,transparent_100%)] px-6"><div class="rounded-xl border bg-background px-6 pt-3 pb-12 shadow-xl dark:bg-muted/50"><!> <!> <!></div></div> <div class="mx-auto mt-6 max-w-lg space-y-6 text-center"><h2 class="text-3xl font-semibold text-balance md:text-4xl lg:text-5xl">Integrate with your favorite LLMs</h2> <p class="text-muted-foreground">Connect seamlessly with popular platforms and services to enhance your workflow.</p> <!></div></div></div></section>`);

export default function Integration_six($$anchor) {
	var section = root_1();
	var div_3 = $.child(section);
	var div_4 = $.child(div_3);
	var div_5 = $.child(div_4);
	var div_6 = $.child(div_5);
	var node_2 = $.child(div_6);

	IntegrationCardv6(node_2, () => ({
		icon: Gemini,
		name: "Gemini",
		description: "The AI model that powers Google's search engine."
	}));

	var node_3 = $.sibling(node_2, 2);

	IntegrationCardv6(node_3, () => ({
		icon: Replit,
		name: "Replit",
		description: "The AI model that powers Google's search engine."
	}));

	var node_4 = $.sibling(node_3, 2);

	IntegrationCardv6(node_4, () => ({
		icon: GooglePaLM,
		name: "GooglePaLM",
		description: "The AI model that powers Google's search engine."
	}));

	$.reset(div_6);
	$.reset(div_5);

	var div_7 = $.sibling(div_5, 2);
	var node_5 = $.sibling($.child(div_7), 4);

	Button(node_5, {
		variant: 'outline',
		size: 'sm',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('Get started');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	$.reset(div_7);
	$.reset(div_4);
	$.reset(div_3);
	$.reset(section);
	$.append($$anchor, section);
}