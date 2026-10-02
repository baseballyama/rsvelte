import * as $ from 'svelte/internal/server';
import { Button, Indicator } from "flowbite-svelte";

export default function Label($$renderer) {
	Button($$renderer, {
		class: 'gap-2',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Messages `);

			Indicator($$renderer, {
				class: 'bg-primary-200 text-primary-800 text-xs font-semibold',
				size: 'lg',
				children: ($$renderer) => {
					$$renderer.push(`<!---->2`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}