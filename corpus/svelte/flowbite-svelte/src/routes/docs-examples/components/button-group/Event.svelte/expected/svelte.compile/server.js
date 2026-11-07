import * as $ from 'svelte/internal/server';
import { ButtonGroup, Button } from "flowbite-svelte";

export default function Event($$renderer) {
	const handleClick = () => {
		alert("Clicked");
	};

	ButtonGroup($$renderer, {
		class: '*:ring-primary-700!',
		children: ($$renderer) => {
			Button($$renderer, {
				onclick: handleClick,
				children: ($$renderer) => {
					$$renderer.push(`<!---->Click me`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Settings`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
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