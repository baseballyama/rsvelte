import * as $ from 'svelte/internal/server';
import { ButtonGroup, Button } from "flowbite-svelte";

export default function Outline($$renderer) {
	ButtonGroup($$renderer, {
		children: ($$renderer) => {
			Button($$renderer, {
				outline: true,
				color: 'dark',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Profile`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				outline: true,
				color: 'dark',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Settings`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				outline: true,
				color: 'dark',
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