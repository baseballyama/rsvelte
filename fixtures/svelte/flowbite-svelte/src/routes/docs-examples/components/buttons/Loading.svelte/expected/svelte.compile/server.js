import * as $ from 'svelte/internal/server';
import { Button } from "flowbite-svelte";

export default function Loading($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let loading = false;

		async function handleSubmit() {
			loading = true;
			await new Promise((resolve) => setTimeout(resolve, 2000));
			loading = false;
		}

		Button($$renderer, {
			class: 'w-32',
			onclick: handleSubmit,
			loading,
			children: ($$renderer) => {
				$$renderer.push(`<!---->Submit`);
			},
			$$slots: { default: true }
		});
	});
}