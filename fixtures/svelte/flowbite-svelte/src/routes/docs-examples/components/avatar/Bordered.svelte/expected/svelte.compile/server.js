import * as $ from 'svelte/internal/server';
import { Avatar } from "flowbite-svelte";

export default function Bordered($$renderer) {
	Avatar($$renderer, { src: '/images/profile-picture-2.webp', border: true });
	$$renderer.push(`<!----> `);

	Avatar($$renderer, {
		src: '/images/profile-picture-2.webp',
		border: true,
		class: 'ring-red-400 dark:ring-red-300'
	});

	$$renderer.push(`<!---->`);
}