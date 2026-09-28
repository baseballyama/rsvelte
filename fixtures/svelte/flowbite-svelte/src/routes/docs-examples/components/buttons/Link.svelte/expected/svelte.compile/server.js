import * as $ from 'svelte/internal/server';
import { Button } from "flowbite-svelte";

export default function Link($$renderer) {
	Button($$renderer, {
		href: '/',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Home`);
		},
		$$slots: { default: true }
	});
}