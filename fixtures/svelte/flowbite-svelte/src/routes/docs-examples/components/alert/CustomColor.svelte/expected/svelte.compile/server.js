import * as $ from 'svelte/internal/server';
import { Alert } from "flowbite-svelte";

export default function CustomColor($$renderer) {
	Alert($$renderer, {
		class: 'bg-sky-500 text-white',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Your content`);
		},
		$$slots: { default: true }
	});
}