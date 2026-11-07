import * as $ from 'svelte/internal/server';
import Card from "$lib/components/ui/card/card.svelte";
import ArrowUp from "@lucide/svelte/icons/arrow-up";
import Globe from "@lucide/svelte/icons/globe";
import Plus from "@lucide/svelte/icons/plus";
import Sparkles from "@lucide/svelte/icons/sparkles";
import Button from "$lib/components/ui/button/button.svelte";

function AIAssistantIllustration($$renderer) {
	Card($$renderer, {
		'aria-hidden': true,
		class: 'mt-6 aspect-video translate-y-4 p-4 pb-6 transition-transform duration-200 group-hover:translate-y-0',
		children: ($$renderer) => {
			$$renderer.push(`<div class="w-fit">`);
			Sparkles($$renderer, { class: 'size-3.5 fill-purple-300 stroke-purple-300' });

			$$renderer.push(`<!----> <p class="mt-2 line-clamp-2 text-sm">How can I optimize my neural network to reduce inference time while maintaining
				accuracy?</p></div> <div class="-mx-3 mt-3 -mb-3 space-y-3 rounded-lg bg-foreground/5 p-3"><div class="text-sm text-muted-foreground">Ask AI Assistant</div> <div class="flex justify-between"><div class="flex gap-2">`);

			Button($$renderer, {
				variant: 'outline',
				size: 'icon',
				class: 'size-7 rounded-2xl bg-transparent shadow-none',
				children: ($$renderer) => {
					Plus($$renderer, {});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				variant: 'outline',
				size: 'icon',
				class: 'size-7 rounded-2xl bg-transparent shadow-none',
				children: ($$renderer) => {
					Globe($$renderer, {});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div> `);

			Button($$renderer, {
				size: 'icon',
				class: 'size-7 rounded-2xl bg-black',
				children: ($$renderer) => {
					ArrowUp($$renderer, { strokeWidth: 3 });
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div></div>`);
		},
		$$slots: { default: true }
	});
}

export default function Eleven($$renderer) {
	const AIDEN_BLESER = "https://avatars.githubusercontent.com/u/117548273?v=4";
	const BHIDE_SVELTE = "https://avatars.githubusercontent.com/u/93428946?v=4";
	const RICH_HARRIS = "https://avatars.githubusercontent.com/u/1162160?v=4";
	const HUNTER_JOHNSTON = "https://avatars.githubusercontent.com/u/64506580?v=4";

	let avatars = [
		{ src: BHIDE_SVELTE, alt: "Bhide Svelte" },
		{ src: AIDEN_BLESER, alt: "Aiden Blesser" },
		{ src: RICH_HARRIS, alt: "Rich Harris" },
		{ src: HUNTER_JOHNSTON, alt: "Hunter Johnston" }
	];

	$$renderer.push(`<section><div class="py-24"><div class="mx-auto w-full max-w-3xl px-6"><h2 class="text-3xl font-semibold text-balance text-foreground md:text-4xl"><span class="text-muted-foreground">Empowering Marketing teams with</span> AI-driven solutions</h2> <div class="@container mt-12 space-y-12">`);

	Card($$renderer, {
		variant: 'soft',
		class: 'relative overflow-hidden p-0 sm:col-span-2',
		children: ($$renderer) => {
			$$renderer.push(`<img src="https://images.unsplash.com/photo-1635776062043-223faf322554?q=80&amp;w=3132&amp;auto=format&amp;fit=crop&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="" class="absolute inset-0 size-full object-cover"/> <div class="m-auto max-w-md p-4 sm:p-12">`);
			AIAssistantIllustration($$renderer);
			$$renderer.push(`<!----></div>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <div class="grid gap-6 @sm:grid-cols-2 @2xl:grid-cols-3"><div class="space-y-2"><h3 class="text-xl font-medium">Generate Ideas</h3> <p class="text-muted-foreground">Spark creativity with AI-powered content suggestions and inspiration.</p></div> <div class="space-y-2"><h3 class="text-xl font-medium">Improve Writing</h3> <p class="text-muted-foreground">Enhance your text with smart editing suggestions and style refinements.</p></div> <div class="space-y-2"><h3 class="text-xl font-medium">Design Layouts</h3> <p class="text-muted-foreground">Create visually appealing layouts that capture your audience's
							attention.</p></div></div></div></div></div></section>`);
}