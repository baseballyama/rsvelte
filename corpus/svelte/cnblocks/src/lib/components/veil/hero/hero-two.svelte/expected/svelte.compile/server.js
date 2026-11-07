import * as $ from 'svelte/internal/server';
import HeaderTwo from "$lib/components/veil/header/header-two.svelte";
import { Button } from "$lib/components/ui/veil/button";
import { Card } from "$lib/components/ui/veil/card";

import {
	Clerk,
	Claude,
	Figma,
	Firebase,
	Linear,
	Slack,
	Supabase,
	Twilio,
	Vercel
} from "$lib/svgs";

import ChevronRight from "@lucide/svelte/icons/chevron-right";

export default function Hero_two($$renderer) {
	HeaderTwo($$renderer, {});
	$$renderer.push(`<!----> <main class="overflow-hidden"><section class="bg-background"><div class="relative pt-44 pb-32"><div class="absolute inset-0 aspect-square mask-radial-[75%_100%] mask-radial-from-45% mask-radial-to-75% mask-radial-at-top opacity-65 md:aspect-9/4 dark:opacity-5"><img src="https://images.unsplash.com/photo-1740516367177-ae20098c8786?q=80&amp;w=2268&amp;auto=format&amp;fit=crop&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3Dt" alt="hero background" width="2102" height="1694" class="h-full w-full object-cover object-top"/></div> <div class="relative z-10 mx-auto w-full max-w-5xl px-6"><div class="mx-auto mb-16 max-w-xl lg:mb-24"><div class="grid scale-95 grid-cols-3 gap-12 **:fill-foreground"><div class="ml-auto blur-[2px]">`);

	Card($$renderer, {
		class: 'flex h-8 w-fit items-center gap-2 rounded-xl px-3 shadow-foreground/10 sm:h-10 sm:px-4',
		children: ($$renderer) => {
			Supabase($$renderer, { class: 'size-4' });
			$$renderer.push(`<!----> <span class="font-medium text-nowrap max-sm:text-xs">Supabase</span>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div> <div class="ml-auto">`);

	Card($$renderer, {
		class: 'flex h-8 w-fit items-center gap-2 rounded-xl px-3 shadow-foreground/10 sm:h-10 sm:px-4',
		children: ($$renderer) => {
			Slack($$renderer, { class: 'size-4' });
			$$renderer.push(`<!----> <span class="font-medium text-nowrap max-sm:text-xs">Slack</span>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div> <div class="ml-auto blur-[2px]">`);

	Card($$renderer, {
		class: 'flex h-8 w-fit items-center gap-2 rounded-xl px-3 shadow-foreground/10 sm:h-10 sm:px-4',
		children: ($$renderer) => {
			Figma($$renderer, { class: 'size-4' });
			$$renderer.push(`<!----> <span class="font-medium text-nowrap max-sm:text-xs">Figma</span>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div> <div class="mr-auto">`);

	Card($$renderer, {
		class: 'flex h-8 w-fit items-center gap-2 rounded-xl px-3 shadow-foreground/10 sm:h-10 sm:px-4',
		children: ($$renderer) => {
			Vercel($$renderer, { class: 'size-4' });
			$$renderer.push(`<!----> <span class="font-medium text-nowrap max-sm:text-xs">Vercel</span>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div> <div class="blur-[2px]">`);

	Card($$renderer, {
		class: 'flex h-8 w-fit items-center gap-2 rounded-xl px-3 shadow-foreground/10 sm:h-10 sm:px-4',
		children: ($$renderer) => {
			Firebase($$renderer, { class: 'size-3 sm:size-4' });
			$$renderer.push(`<!----> <span class="font-medium text-nowrap max-sm:text-xs">Firebase</span>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div> <div>`);

	Card($$renderer, {
		class: 'mx-a flex h-8 h-10 w-fit items-center gap-2 rounded-xl px-3 shadow-foreground/10 sm:h-10 sm:px-4',
		children: ($$renderer) => {
			Linear($$renderer, { class: 'size-3 sm:size-4' });
			$$renderer.push(`<!----> <span class="font-medium text-nowrap max-sm:text-xs">Linear</span>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div> <div class="ml-auto blur-[2px]">`);

	Card($$renderer, {
		class: 'flex h-8 w-fit items-center gap-2 rounded-xl px-3 shadow-foreground/10 sm:h-10 sm:px-4',
		children: ($$renderer) => {
			Twilio($$renderer, { class: 'size-3 sm:size-4' });
			$$renderer.push(`<!----> <span class="font-medium text-nowrap max-sm:text-xs">Twilio</span>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div> <div>`);

	Card($$renderer, {
		class: 'mx-a flex h-8 h-10 w-fit items-center gap-2 rounded-xl px-3 shadow-foreground/10 sm:h-10 sm:px-4',
		children: ($$renderer) => {
			Claude($$renderer, { class: 'size-3 sm:size-4' });
			$$renderer.push(`<!----> <span class="font-medium text-nowrap max-sm:text-xs">Claude AI</span>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div> <div class="blur-[2px]">`);

	Card($$renderer, {
		class: 'flex h-8 w-fit items-center gap-2 rounded-xl px-3 shadow-foreground/10 sm:h-10 sm:px-4',
		children: ($$renderer) => {
			Clerk($$renderer, { class: 'size-3 sm:size-4' });
			$$renderer.push(`<!----> <span class="font-medium text-nowrap max-sm:text-xs">Clerk</span>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div></div></div> <div class="mx-auto max-w-md text-center"><h1 class="font-serif text-4xl font-medium text-balance sm:text-5xl">Ship faster. Integrate smarter.</h1> <p class="mt-4 text-balance text-muted-foreground">Veil is your all-in-one engine for adding seamless integrations to your app.</p> `);

	Button($$renderer, {
		class: 'mt-6 pr-1.5',
		href: '#link',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Start Building `);
			ChevronRight($$renderer, { class: 'opacity-50' });
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div></div></div></section></main>`);
}