import * as $ from 'svelte/internal/server';
import { Avatar } from "flowbite-svelte";

export default function Sizes($$renderer) {
	$$renderer.push(`<div class="flex flex-wrap justify-center space-x-4 rtl:space-x-reverse">`);
	Avatar($$renderer, { src: '/images/profile-picture-3.webp', size: 'xs' });
	$$renderer.push(`<!----> `);
	Avatar($$renderer, { src: '/images/profile-picture-3.webp', size: 'sm' });
	$$renderer.push(`<!----> `);
	Avatar($$renderer, { src: '/images/profile-picture-3.webp', size: 'md' });
	$$renderer.push(`<!----> `);
	Avatar($$renderer, { src: '/images/profile-picture-3.webp', size: 'lg' });
	$$renderer.push(`<!----> `);
	Avatar($$renderer, { src: '/images/profile-picture-3.webp', size: 'xl' });
	$$renderer.push(`<!----> `);
	Avatar($$renderer, { src: '/images/profile-picture-3.webp', class: 'h-28 w-28' });
	$$renderer.push(`<!----></div>`);
}