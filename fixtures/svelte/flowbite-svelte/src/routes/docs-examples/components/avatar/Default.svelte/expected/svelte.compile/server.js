import * as $ from 'svelte/internal/server';
import { Avatar } from "flowbite-svelte";

export default function Default($$renderer) {
	$$renderer.push(`<div class="flex space-x-4 rtl:space-x-reverse">`);
	Avatar($$renderer, { src: '/images/profile-picture-2.webp' });
	$$renderer.push(`<!----> `);

	Avatar($$renderer, {
		src: '/images/profile-picture-2.webp',
		cornerStyle: 'rounded'
	});

	$$renderer.push(`<!----></div>`);
}