import * as $ from 'svelte/internal/server';
import { Toast } from "flowbite-svelte";

export default function Undo($$renderer) {
	Toast($$renderer, {
		classes: {
			content: "w-full text-sm font-normal flex items-center justify-between"
		},

		children: ($$renderer) => {
			$$renderer.push(`<!---->Conversation archived. <a class="text-primary-600 hover:bg-primary-100 dark:text-primary-500 ms-auto rounded-lg p-1.5 font-medium dark:hover:bg-gray-700" href="/">Undo</a>`);
		},
		$$slots: { default: true }
	});
}