import * as $ from 'svelte/internal/server';
import { P } from "flowbite-svelte";

export default function FontStyle($$renderer) {
	P($$renderer, {
		italic: true,
		children: ($$renderer) => {
			$$renderer.push(`<!---->The crypto identity primitive.`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	P($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->The crypto identity primitive.`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}