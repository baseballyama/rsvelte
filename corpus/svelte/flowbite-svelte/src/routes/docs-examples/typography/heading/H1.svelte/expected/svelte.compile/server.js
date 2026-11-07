import * as $ from 'svelte/internal/server';
import { Heading } from "flowbite-svelte";

export default function H1($$renderer) {
	Heading($$renderer, {
		tag: 'h1',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Heading 1`);
		},
		$$slots: { default: true }
	});
}