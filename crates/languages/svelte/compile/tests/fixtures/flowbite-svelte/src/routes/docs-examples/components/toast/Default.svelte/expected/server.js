import * as $ from 'svelte/internal/server';
import { Toast } from "flowbite-svelte";
import { FireOutline } from "flowbite-svelte-icons";

export default function Default($$renderer) {
	{
		function icon($$renderer) {
			FireOutline($$renderer, {
				class: 'text-primary-500 bg-primary-100 dark:bg-primary-800 dark:text-primary-200 h-6 w-6'
			});
		}

		Toast($$renderer, {
			icon,
			children: ($$renderer) => {
				$$renderer.push(`<!---->Set yourself free.`);
			},
			$$slots: { icon: true, default: true }
		});
	}
}