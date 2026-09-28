import * as $ from 'svelte/internal/server';
import { Heading } from "flowbite-svelte";

export default function H3($$renderer) {
	Heading($$renderer, {
		tag: 'h3',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Heading 3`);
		},
		$$slots: { default: true }
	});
}