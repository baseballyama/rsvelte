import * as $ from 'svelte/internal/server';
import { PaginationItem } from "flowbite-svelte";

export default function PreviousNext2($$renderer) {
	const previous = () => {
		alert("Previous btn clicked. Make a call to your server to fetch data.");
	};

	const next = () => {
		alert("Next btn clicked. Make a call to your server to fetch data.");
	};

	$$renderer.push(`<div class="flex space-x-3 rtl:space-x-reverse">`);

	PaginationItem($$renderer, {
		onclick: previous,
		children: ($$renderer) => {
			$$renderer.push(`<!---->Previous`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	PaginationItem($$renderer, {
		onclick: next,
		children: ($$renderer) => {
			$$renderer.push(`<!---->Next`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div> <div class="flex space-x-3 rtl:space-x-reverse">`);

	PaginationItem($$renderer, {
		size: 'large',
		onclick: previous,
		children: ($$renderer) => {
			$$renderer.push(`<!---->Previous`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	PaginationItem($$renderer, {
		size: 'large',
		onclick: next,
		children: ($$renderer) => {
			$$renderer.push(`<!---->Next`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div>`);
}