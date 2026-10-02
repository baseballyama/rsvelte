import * as $ from 'svelte/internal/server';
import { Checkbox } from "flowbite-svelte";

export default function Link($$renderer) {
	Checkbox($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->I agree with the <a href="/" class="text-primary-600 dark:text-primary-500 ms-1 hover:underline">terms and conditions</a> .`);
		},
		$$slots: { default: true }
	});
}