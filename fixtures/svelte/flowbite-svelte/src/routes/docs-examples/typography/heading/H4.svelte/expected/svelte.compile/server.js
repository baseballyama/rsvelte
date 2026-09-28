import * as $ from 'svelte/internal/server';
import { Heading } from "flowbite-svelte";

export default function H4($$renderer) {
	Heading($$renderer, {
		tag: 'h4',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Heading 4`);
		},
		$$slots: { default: true }
	});
}