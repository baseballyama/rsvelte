import * as $ from 'svelte/internal/server';
import { Toast } from "flowbite-svelte";
import { PaperPlaneOutline } from "flowbite-svelte-icons";

export default function Simple($$renderer) {
	{
		function icon($$renderer) {
			PaperPlaneOutline($$renderer, {
				class: 'text-primary-600 dark:text-primary-500 h-5 w-5 rotate-45'
			});
		}

		Toast($$renderer, {
			dismissable: false,
			icon,
			children: ($$renderer) => {
				$$renderer.push(`<div class="ps-4 text-sm font-normal">Message sent successfully.</div>`);
			},
			$$slots: { icon: true, default: true }
		});
	}
}