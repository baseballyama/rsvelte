import * as $ from 'svelte/internal/server';
import { Avatar, AvatarFallback, AvatarImage } from "$lib/components/ui/avatar";

export default function Four($$renderer) {
	$$renderer.push(`<section class="[--color-primary:var(--color-indigo-500)]"><div class="py-24"><div class="mx-auto w-full max-w-5xl px-6"><blockquote class="relative max-w-xl pl-6 before:absolute before:inset-y-0 before:left-0 before:w-1 before:rounded-full before:bg-primary"><p class="text-lg text-foreground">Using Tailark has been like unlocking a secret design superpower. It's the
					perfect fusion of simplicity and versatility, enabling us to create UIs that are
					as stunning as they are user-friendly.</p> <footer class="mt-4 flex items-center gap-2">`);

	Avatar($$renderer, {
		class: ' size-6 border border-transparent shadow ring-1',
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

	$$renderer.push(`<!----> <cite>Théo Balick</cite> <span aria-hidden="true" class="size-1 rounded-full bg-foreground/15"></span> <span class="text-muted-foreground">Product Designer</span></footer></blockquote></div></div></section>`);
}