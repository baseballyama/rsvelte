import * as $ from 'svelte/internal/server';
import { Heading } from "flowbite-svelte";

export default function H5($$renderer) {
	Heading($$renderer, {
		tag: 'h5',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Heading 5`);
		},
		$$slots: { default: true }
	});
}