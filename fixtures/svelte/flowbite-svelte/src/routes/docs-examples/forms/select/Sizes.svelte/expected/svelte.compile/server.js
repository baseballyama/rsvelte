import * as $ from 'svelte/internal/server';
import { Select, Label } from "flowbite-svelte";

export default function Sizes($$renderer) {
	let countries = [
		{ value: "us", name: "United States" },
		{ value: "ca", name: "Canada" },
		{ value: "fr", name: "France" }
	];

	Label($$renderer, {
		for: 'select-sm',
		class: 'mb-2',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Small select`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);
	Select($$renderer, { id: 'select-sm', size: 'sm', items: countries, class: 'mb-6' });
	$$renderer.push(`<!----> `);

	Label($$renderer, {
		for: 'select-md',
		class: 'mb-2',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Default select`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);
	Select($$renderer, { id: 'select-md', size: 'md', items: countries, class: 'mb-6' });
	$$renderer.push(`<!----> `);

	Label($$renderer, {
		for: 'select-lg',
		class: 'mb-2',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Large select`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);
	Select($$renderer, { id: 'select-lg', size: 'lg', items: countries, class: 'mb-6' });
	$$renderer.push(`<!----> <p class="my-6"></p> `);

	Label($$renderer, {
		for: 'select-sm',
		class: 'sr-only',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Underline small select`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Select($$renderer, {
		id: 'select-sm',
		underline: true,
		size: 'sm',
		items: countries,
		class: 'mb-6'
	});

	$$renderer.push(`<!----> `);

	Label($$renderer, {
		for: 'select-md',
		class: 'sr-only',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Underline default select`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Select($$renderer, {
		id: 'select-md',
		underline: true,
		size: 'md',
		items: countries,
		class: 'mb-6'
	});

	$$renderer.push(`<!----> `);

	Label($$renderer, {
		for: 'select-lg',
		class: 'sr-only',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Underline large select`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Select($$renderer, {
		id: 'select-lg',
		underline: true,
		size: 'lg',
		items: countries,
		class: 'mb-6'
	});

	$$renderer.push(`<!---->`);
}