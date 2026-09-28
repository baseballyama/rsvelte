import * as $ from 'svelte/internal/server';
import { P, Span } from "flowbite-svelte";

export default function Uppercase($$renderer) {
	P($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->The crypto `);

			Span($$renderer, {
				class: 'uppercase',
				children: ($$renderer) => {
					$$renderer.push(`<!---->identity`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> primitive.`);
		},
		$$slots: { default: true }
	});
}