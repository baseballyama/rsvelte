import * as $ from 'svelte/internal/server';
import { PaginationItem } from "flowbite-svelte";
import { ArrowLeftOutline, ArrowRightOutline } from "flowbite-svelte-icons";

export default function PreviousNextIcons2($$renderer) {
	const previous = () => {
		alert("Previous btn clicked. Make a call to your server to fetch data.");
	};

	const next = () => {
		alert("Next btn clicked. Make a call to your server to fetch data.");
	};

	$$renderer.push(`<div class="flex space-x-3 rtl:space-x-reverse">`);

	PaginationItem($$renderer, {
		class: 'flex items-center',
		onclick: previous,
		children: ($$renderer) => {
			ArrowLeftOutline($$renderer, { class: 'me-2 h-3.5 w-3.5' });
			$$renderer.push(`<!----> Previous`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	PaginationItem($$renderer, {
		class: 'flex items-center',
		onclick: next,
		children: ($$renderer) => {
			$$renderer.push(`<!---->Next `);
			ArrowRightOutline($$renderer, { class: 'ms-2 h-3.5 w-3.5' });
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div> <div class="flex space-x-3 rtl:space-x-reverse">`);

	PaginationItem($$renderer, {
		size: 'large',
		class: 'flex items-center',
		onclick: previous,
		children: ($$renderer) => {
			ArrowLeftOutline($$renderer, { class: 'me-2 h-5 w-5' });
			$$renderer.push(`<!----> Previous`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	PaginationItem($$renderer, {
		size: 'large',
		class: 'flex items-center',
		onclick: next,
		children: ($$renderer) => {
			$$renderer.push(`<!---->Next `);
			ArrowRightOutline($$renderer, { class: 'ms-2 h-5 w-5' });
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div>`);
}