import * as $ from 'svelte/internal/server';
import { Heading } from "flowbite-svelte";

export default function H2($$renderer) {
	Heading($$renderer, {
		tag: 'h2',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Heading 2`);
		},
		$$slots: { default: true }
	});
}