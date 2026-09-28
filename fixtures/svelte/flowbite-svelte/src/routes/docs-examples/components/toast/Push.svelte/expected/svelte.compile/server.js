import * as $ from 'svelte/internal/server';
import { Toast, Avatar } from "flowbite-svelte";

export default function Push($$renderer) {
	Toast($$renderer, {
		align: false,
		children: ($$renderer) => {
			$$renderer.push(`<span class="font-semibold text-gray-900 dark:text-white">New notification</span> <div class="mt-3 flex items-center">`);
			Avatar($$renderer, { src: '/images/profile-picture-3.webp' });
			$$renderer.push(`<!----> <div class="ms-3"><h4 class="text-sm font-semibold text-gray-900 dark:text-white">Bonnie Green</h4> <div class="text-sm font-normal">commented on your photo</div> <span class="text-primary-600 dark:text-primary-500 text-xs font-medium">a few seconds ago</span></div></div>`);
		},
		$$slots: { default: true }
	});
}