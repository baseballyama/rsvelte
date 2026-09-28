import * as $ from 'svelte/internal/server';
import { Heading } from "flowbite-svelte";

export default function H6($$renderer) {
	Heading($$renderer, {
		tag: 'h6',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Heading 6`);
		},
		$$slots: { default: true }
	});
}