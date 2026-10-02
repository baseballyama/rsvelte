import * as $ from 'svelte/internal/server';
import { Avatar, AvatarFallback, AvatarImage } from "$lib/components/ui/avatar";
import Quote from "@lucide/svelte/icons/quote";

export default function Five($$renderer) {
	$$renderer.push(`<section><div class="bg-muted py-24"><div class="mx-auto w-full max-w-2xl px-6 text-center"><div class="max-w-xl">`);

	Quote($$renderer, {
		class: 'mx-auto size-8 fill-background stroke-background drop-shadow-sm'
	});

	$$renderer.push(`<!----> <blockquote class="mt-6"><p class="text-xl text-foreground">Using Tailark has been like unlocking a secret design superpower. It's the
						perfect fusion of simplicity and versatility, enabling us to create UIs that
						are as stunning as they are user-friendly.</p> <footer class="mt-6 flex flex-col items-center justify-center">`);

	Avatar($$renderer, {
		class: ' size-12 border border-transparent shadow ring-1',
		children: ($$renderer) => {
			AvatarImage($$renderer, {
				src: 'https://avatars.githubusercontent.com/u/68236786?v=4',
				alt: 'Théo Balick'
			});

			$$renderer.push(`<!----> `);

			AvatarFallback($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->T`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <cite class="mt-2 text-lg font-medium text-foreground">Théo Balick</cite> <span class="text-muted-foreground">@theo_b</span></footer></blockquote></div></div></div></section>`);
}