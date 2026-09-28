import * as $ from 'svelte/internal/server';
import { ButtonGroup, Button } from "flowbite-svelte";

export default function Links($$renderer) {
	ButtonGroup($$renderer, {
		class: '*:ring-primary-700!',
		children: ($$renderer) => {
			Button($$renderer, {
				href: '/',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Profile`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				href: '/',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Settings`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				href: '/',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Messages`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}