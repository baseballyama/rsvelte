import * as $ from 'svelte/internal/server';
import { Progressbar } from "flowbite-svelte";

export default function CustomStyle($$renderer) {
	Progressbar($$renderer, {
		progress: '50',
		size: 'h-3',
		labelInside: true,
		color: 'green',
		classes: {
			label: "text-xs font-medium text-center p-0 leading-none rounded-full"
		},
		class: 'my-4',
		labelOutside: 'Size h-3'
	});

	$$renderer.push(`<!----> `);

	Progressbar($$renderer, {
		progress: '50',
		size: 'h-10',
		labelInside: true,
		color: 'red',
		classes: {
			label: "text-2xl font-medium text-center p-2 leading-none rounded-full"
		},
		class: 'my-4',
		labelOutside: 'Size h-10'
	});

	$$renderer.push(`<!----> `);

	Progressbar($$renderer, {
		progress: '50',
		size: 'h-6',
		labelInside: true,
		classes: {
			label: "text-base font-medium text-center p-1 leading-none rounded-full"
		},
		class: 'my-4',
		labelOutside: 'Size h-6'
	});

	$$renderer.push(`<!---->`);
}