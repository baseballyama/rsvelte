import * as $ from 'svelte/internal/server';
import { Avatar, AvatarFallback, AvatarImage } from '$lib/components/ui/avatar';

export default function Avatar_07($$renderer) {
	$$renderer.push(`<div class="relative">`);

	Avatar($$renderer, {
		class: 'rounded-lg',
		children: ($$renderer) => {
			AvatarImage($$renderer, { src: '/avatar-80-07.jpg', alt: 'Kelly King' });
			$$renderer.push(`<!----> `);

			AvatarFallback($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->KK`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <span class="border-background absolute -end-1 -top-1 size-3 rounded-full border-2 bg-emerald-500"><span class="sr-only">Online</span></span></div>`);
}