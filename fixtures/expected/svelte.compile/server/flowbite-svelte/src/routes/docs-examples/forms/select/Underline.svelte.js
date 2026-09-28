import * as $ from 'svelte/internal/server';
import { Select, Label } from "flowbite-svelte";

export default function Underline($$renderer) {
	let countries = [
		{ value: "us", name: "United States" },
		{ value: "ca", name: "Canada" },
		{ value: "fr", name: "France" }
	];

	Label($$renderer, {
		for: 'select-underline',
		class: 'sr-only',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Underline select`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Select($$renderer, {
		id: 'select-underline',
		underline: true,
		class: 'mt-2',
		items: countries
	});

	$$renderer.push(`<!---->`);
}