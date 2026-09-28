import * as $ from 'svelte/internal/server';
import { Avatar } from "flowbite-svelte";

export default function Stacked($$renderer) {
	$$renderer.push(`<div class="mb-5 flex">`);
	Avatar($$renderer, { src: '/images/profile-picture-1.webp', stacked: true });
	$$renderer.push(`<!----> `);
	Avatar($$renderer, { src: '/images/profile-picture-2.webp', stacked: true });
	$$renderer.push(`<!----> `);
	Avatar($$renderer, { src: '/images/profile-picture-3.webp', stacked: true });
	$$renderer.push(`<!----> `);
	Avatar($$renderer, { stacked: true });
	$$renderer.push(`<!----></div> <div class="flex">`);
	Avatar($$renderer, { src: '/images/profile-picture-1.webp', stacked: true });
	$$renderer.push(`<!----> `);
	Avatar($$renderer, { src: '/images/profile-picture-2.webp', stacked: true });
	$$renderer.push(`<!----> `);
	Avatar($$renderer, { src: '/images/profile-picture-3.webp', stacked: true });
	$$renderer.push(`<!----> `);

	Avatar($$renderer, {
		stacked: true,
		href: '/',
		class: 'bg-gray-700 text-sm text-white hover:bg-gray-600',
		children: ($$renderer) => {
			$$renderer.push(`<!---->+99`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div>`);
}