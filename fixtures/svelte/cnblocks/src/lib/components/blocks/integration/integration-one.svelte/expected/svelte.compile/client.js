import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import IntegrationCard from "./card/integration-card.svelte";
import { Gemini, GooglePaLM, MagicUI, VSCodium, Replit, MediaWiki } from "../logos/logos";

var root = $.from_html(`<section><div class="py-32"><div class="mx-auto max-w-5xl px-6"><div class="text-center"><h2 class="text-3xl font-semibold text-balance md:text-4xl">Integrate with your favorite tools</h2> <p class="mt-6 text-muted-foreground">Connect seamlessly with popular platforms and services to enhance your workflow.</p></div> <div class="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3"><!> <!> <!> <!> <!> <!></div></div></div></section>`);

export default function Integration_one($$anchor) {
	var // Scroll below for the component code
	section = root();

	var div = $.child(section);
	var div_1 = $.child(div);
	var div_2 = $.sibling($.child(div_1), 2);
	var node = $.child(div_2);

	IntegrationCard(node, {
		title: 'Google Gemini',
		description: 'Amet praesentium deserunt ex commodi tempore fuga voluptatem. Sit, sapiente.',
		children: ($$anchor, $$slotProps) => {
			Gemini($$anchor, {});
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	IntegrationCard(node_1, {
		title: 'Replit',
		description: 'Amet praesentium deserunt ex commodi tempore fuga voluptatem. Sit, sapiente.',
		children: ($$anchor, $$slotProps) => {
			Replit($$anchor, {});
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	IntegrationCard(node_2, {
		title: 'Magic UI',
		description: 'Amet praesentium deserunt ex commodi tempore fuga voluptatem. Sit, sapiente.',
		children: ($$anchor, $$slotProps) => {
			MagicUI($$anchor, {});
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 2);

	IntegrationCard(node_3, {
		title: 'VSCodium',
		description: 'Amet praesentium deserunt ex commodi tempore fuga voluptatem. Sit, sapiente.',
		children: ($$anchor, $$slotProps) => {
			VSCodium($$anchor, {});
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_3, 2);

	IntegrationCard(node_4, {
		title: 'MediaWiki',
		description: 'Amet praesentium deserunt ex commodi tempore fuga voluptatem. Sit, sapiente.',
		children: ($$anchor, $$slotProps) => {
			MediaWiki($$anchor, {});
		},
		$$slots: { default: true }
	});

	var node_5 = $.sibling(node_4, 2);

	IntegrationCard(node_5, {
		title: 'Google PaLM',
		description: 'Amet praesentium deserunt ex commodi tempore fuga voluptatem. Sit, sapiente.',
		children: ($$anchor, $$slotProps) => {
			GooglePaLM($$anchor, {});
		},
		$$slots: { default: true }
	});

	$.reset(div_2);
	$.reset(div_1);
	$.reset(div);
	$.reset(section);
	$.append($$anchor, section);
}