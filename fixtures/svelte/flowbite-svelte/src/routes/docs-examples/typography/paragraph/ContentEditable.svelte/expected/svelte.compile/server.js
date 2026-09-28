import * as $ from 'svelte/internal/server';
import { P } from "flowbite-svelte";

export default function ContentEditable($$renderer) {
	P($$renderer, {
		contenteditable: true,
		children: ($$renderer) => {
			$$renderer.push(`<!---->Track work across the enterprise through an open, collaborative platform.`);
		},
		$$slots: { default: true }
	});
}