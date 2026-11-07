import * as $ from 'svelte/internal/server';
import { modalStack } from './modal-stack';

export default function ModalPortal($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<aside class="z-modal pointer-events-none fixed inset-0"><!--[-->`);

		const each_array = $.ensure_array_like(modalStack.items);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let modal = each_array[$$index];

			$$renderer.push(`<div class="pointer-events-auto h-full w-full"></div>`);
		}

		$$renderer.push(`<!--]--></aside>`);
	});
}