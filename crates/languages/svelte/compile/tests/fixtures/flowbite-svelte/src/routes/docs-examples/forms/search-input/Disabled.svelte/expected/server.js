import * as $ from 'svelte/internal/server';
import { Search, Button } from "flowbite-svelte";

export default function Disabled($$renderer) {
	Search($$renderer, {
		disabled: true,
		children: ($$renderer) => {
			Button($$renderer, {
				disabled: true,
				class: 'me-1',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Search`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}