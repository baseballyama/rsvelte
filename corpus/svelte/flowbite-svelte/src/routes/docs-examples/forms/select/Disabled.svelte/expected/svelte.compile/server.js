import * as $ from 'svelte/internal/server';
import { Select, Label } from "flowbite-svelte";

export default function Disabled($$renderer) {
	let countries = [
		{ value: "us", name: "United States" },
		{ value: "ca", name: "Canada" },
		{ value: "fr", name: "France" }
	];

	Label($$renderer, {
		for: 'select-disabled',
		class: 'mb-2',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Disabled select`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Select($$renderer, {
		id: 'select-disabled',
		disabled: true,
		items: countries,
		placeholder: 'You can\'t select anything...'
	});

	$$renderer.push(`<!---->`);
}