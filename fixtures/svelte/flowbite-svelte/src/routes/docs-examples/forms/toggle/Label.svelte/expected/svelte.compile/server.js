import * as $ from 'svelte/internal/server';
import { Toggle } from "flowbite-svelte";

export default function Label($$renderer) {
	{
		function offLabel($$renderer) {
			$$renderer.push(`<!---->dark mode`);
		}

		Toggle($$renderer, {
			offLabel,
			children: ($$renderer) => {
				$$renderer.push(`<!---->light mode`);
			},
			$$slots: { offLabel: true, default: true }
		});
	}
}