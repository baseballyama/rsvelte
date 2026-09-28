import * as $ from 'svelte/internal/server';
import Badge from '$lib/components/ui/badge.svelte';
import { Avatar, AvatarFallback, AvatarImage } from '$lib/components/ui/avatar';

export default function Avatar_09($$renderer) {
	$$renderer.push(`<div class="relative">`);

	Avatar($$renderer, {
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

	$$renderer.push(`<!----> `);

	Badge($$renderer, {
		class: 'border-background absolute -top-1.5 left-full min-w-5 -translate-x-3.5 px-1',
		children: ($$renderer) => {
			$$renderer.push(`<!---->6`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div>`);
}