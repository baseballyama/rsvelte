import * as $ from 'svelte/internal/server';
import { Search, Button } from "flowbite-svelte";

export default function Default($$renderer) {
	Search($$renderer, {
		children: ($$renderer) => {
			Button($$renderer, {
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