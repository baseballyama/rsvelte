import * as $ from 'svelte/internal/server';
import Gemini from "../mlogos/Gemini.svelte";
import GooglePaLM from "../mlogos/GooglePaLM.svelte";
import Replit from "../mlogos/Replit.svelte";
import MediaWiki from "../mlogos/MediaWiki.svelte";
import MagicUI from "../mlogos/MagicUI.svelte";
import VSCodium from "../mlogos/VSCodium.svelte";
import IntegrationCard from "./integration-card.svelte";

export default function Three($$renderer) {
	$$renderer.push(`<section><div class="py-32"><div class="mx-auto max-w-5xl px-6"><div><h2 class="text-3xl font-semibold text-balance md:text-4xl">Integrate with your favorite tools</h2> <p class="mt-3 text-lg text-muted-foreground">Connect seamlessly with popular platforms and services to enhance your workflow.</p></div> <div class="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">`);

	IntegrationCard($$renderer, {
		title: 'Google Gemini',
		description: 'Amet praesentium deserunt ex commodi tempore fuga voluptatem. Sit, sapiente.',
		children: ($$renderer) => {
			Gemini($$renderer, {});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	IntegrationCard($$renderer, {
		title: 'Replit',
		description: 'Amet praesentium deserunt ex commodi tempore fuga voluptatem. Sit, sapiente.',
		children: ($$renderer) => {
			Replit($$renderer, {});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	IntegrationCard($$renderer, {
		title: 'Magic UI',
		description: 'Amet praesentium deserunt ex commodi tempore fuga voluptatem. Sit, sapiente.',
		children: ($$renderer) => {
			MagicUI($$renderer, {});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	IntegrationCard($$renderer, {
		title: 'VSCodium',
		description: 'Amet praesentium deserunt ex commodi tempore fuga voluptatem. Sit, sapiente.',
		children: ($$renderer) => {
			VSCodium($$renderer, {});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	IntegrationCard($$renderer, {
		title: 'MediaWiki',
		description: 'Amet praesentium deserunt ex commodi tempore fuga voluptatem. Sit, sapiente.',
		children: ($$renderer) => {
			MediaWiki($$renderer, {});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	IntegrationCard($$renderer, {
		title: 'Google PaLM',
		description: 'Amet praesentium deserunt ex commodi tempore fuga voluptatem. Sit, sapiente.',
		children: ($$renderer) => {
			GooglePaLM($$renderer, {});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div></div></div></section>`);
}