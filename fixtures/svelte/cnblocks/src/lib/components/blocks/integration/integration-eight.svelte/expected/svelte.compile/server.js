import * as $ from 'svelte/internal/server';
import { Gemini, GooglePaLM, MagicUI, VSCodium, Replit, MediaWiki } from "../logos/logos";
import Button from "$lib/components/ui/button/button.svelte";

function IntergrationCardv8($$renderer, { icon, name, description }) {
	const Icon = icon;

	$$renderer.push(`<div class="space-y-4 rounded-lg border p-4 transition-colors hover:bg-muted dark:hover:bg-muted/50"><div class="flex size-fit items-center justify-center">`);

	if (Icon) {
		$$renderer.push('<!--[-->');
		Icon($$renderer, {});
		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}

	$$renderer.push(`</div> <div class="space-y-1"><h3 class="text-sm font-medium">${$.escape(name)}</h3> <p class="line-clamp-1 text-sm text-muted-foreground md:line-clamp-2">${$.escape(description)}</p></div></div>`);
}

export default function Integration_eight($$renderer) {
	$$renderer.push(`<section><div class="bg-muted py-24 md:py-32 dark:bg-background"><div class="mx-auto flex flex-col px-6 md:grid md:max-w-5xl md:grid-cols-2 md:gap-12"><div class="order-last mt-6 flex flex-col gap-12 md:order-first"><div class="space-y-6"><h2 class="text-3xl font-semibold text-balance md:text-4xl lg:text-5xl">Integrate with your favorite LLMs</h2> <p class="text-muted-foreground">Connect seamlessly with popular platforms and services to enhance your
						workflow.</p> `);

	Button($$renderer, {
		variant: 'outline',
		size: 'sm',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Get started`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div> <div class="mt-auto grid grid-cols-[auto_1fr] gap-3"><div class="flex aspect-square items-center justify-center border bg-background">`);
	MediaWiki($$renderer, { class: 'size-9' });
	$$renderer.push(`<!----></div> <blockquote><p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.</p> <div class="mt-2 flex gap-2 text-sm"><cite>John Doe</cite> <p class="text-muted-foreground">Founder, MediaWiki</p></div></blockquote></div></div> <div class="-mx-6 mask-[radial-gradient(ellipse_100%_100%_at_50%_0%,#000_70%,transparent_100%)] px-6 sm:mx-auto sm:max-w-md md:-mx-6 md:mr-0 md:ml-auto"><div class="rounded-2xl border bg-background p-3 shadow-lg md:pb-12 dark:bg-muted/50"><div class="grid grid-cols-2 gap-2">`);

	IntergrationCardv8($$renderer, {
		icon: Gemini,
		name: "Gemini",
		description: "The AI model that powers Google's search engine."
	});

	$$renderer.push(`<!----> `);

	IntergrationCardv8($$renderer, {
		icon: Replit,
		name: "Replit",
		description: "The AI model that powers Google's search engine."
	});

	$$renderer.push(`<!----> `);

	IntergrationCardv8($$renderer, {
		icon: GooglePaLM,
		name: "GooglePaLM",
		description: "The AI model that powers Google's search engine."
	});

	$$renderer.push(`<!----> `);

	IntergrationCardv8($$renderer, {
		icon: MagicUI,
		name: "MagicUI",
		description: "The AI model that powers Google's search engine."
	});

	$$renderer.push(`<!----> `);

	IntergrationCardv8($$renderer, {
		icon: VSCodium,
		name: "VSCodium",
		description: "The AI model that powers Google's search engine."
	});

	$$renderer.push(`<!----> `);

	IntergrationCardv8($$renderer, {
		icon: MediaWiki,
		name: "MediaWiki",
		description: "The AI model that powers Google's search engine."
	});

	$$renderer.push(`<!----></div></div></div></div></div></section>`);
}