import * as $ from 'svelte/internal/server';
import { A } from "flowbite-svelte";

export default function Default($$renderer) {
	A($$renderer, {
		class: 'font-medium hover:underline',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Read more`);
		},
		$$slots: { default: true }
	});
}