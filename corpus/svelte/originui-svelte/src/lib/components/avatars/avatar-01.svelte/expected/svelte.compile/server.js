import * as $ from 'svelte/internal/server';
import { Avatar, AvatarFallback, AvatarImage } from '$lib/components/ui/avatar';

export default function Avatar_01($$renderer) {
	Avatar($$renderer, {
		children: ($$renderer) => {
			AvatarImage($$renderer, { src: '/avatar-80-07.jpg', alt: 'Kelly King' });
			$$renderer.push(`<!----> `);

			AvatarFallback($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->CN`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}