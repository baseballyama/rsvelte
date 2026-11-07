import * as $ from 'svelte/internal/server';
import { flip } from 'svelte/animate';
import { fly, fade } from 'svelte/transition';
import { notiStack } from './notification-stack';

export default function NotificationPortal($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<aside class="z-notification pointer-events-none fixed inset-y-0 right-0 flex flex-col-reverse justify-end gap-4 p-10 md:left-1/2 md:justify-start"><!--[-->`);

		const each_array = $.ensure_array_like(notiStack.items);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let notification = each_array[$$index];

			$$renderer.push(`<div class="relative w-full"></div>`);
		}

		$$renderer.push(`<!--]--></aside>`);
	});
}