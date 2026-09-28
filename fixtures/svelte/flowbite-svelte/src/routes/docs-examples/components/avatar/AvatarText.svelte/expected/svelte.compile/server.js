import * as $ from 'svelte/internal/server';
import { Avatar } from "flowbite-svelte";

export default function AvatarText($$renderer) {
	$$renderer.push(`<div class="flex items-center space-x-4 rtl:space-x-reverse">`);

	Avatar($$renderer, {
		src: '/images/profile-picture-1.webp',
		cornerStyle: 'rounded'
	});

	$$renderer.push(`<!----> <div class="space-y-1 font-medium dark:text-white"><div>Jese Leos</div> <div class="text-sm text-gray-500 dark:text-gray-400">Joined in August 2014</div></div></div>`);
}