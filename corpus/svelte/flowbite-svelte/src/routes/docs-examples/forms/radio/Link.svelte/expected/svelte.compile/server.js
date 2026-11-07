import * as $ from 'svelte/internal/server';
import { Radio } from "flowbite-svelte";

export default function Link($$renderer) {
	Radio($$renderer, {
		name: 'with-link',
		children: ($$renderer) => {
			$$renderer.push(`<!---->I agree with the <a href="/" class="text-primary-600 dark:text-primary-500 ms-1 hover:underline">terms and conditions</a> .`);
		},
		$$slots: { default: true }
	});
}