import * as $ from 'svelte/internal/server';
import { P } from "flowbite-svelte";

export default function Normal($$renderer) {
	P($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->The crypto identity primitive.`);
		},
		$$slots: { default: true }
	});
}