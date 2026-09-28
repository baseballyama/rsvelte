import * as $ from 'svelte/internal/server';
import { Progressbar, Button } from "flowbite-svelte";
import { sineOut } from "svelte/easing";

export default function Animation($$renderer) {
	let progress = "45";

	Progressbar($$renderer, {
		progress,
		animate: true,
		precision: 2,
		labelOutside: 'With animation',
		labelInside: true,
		tweenDuration: 1500,
		easing: sineOut,
		size: 'h-6',
		classes: {
			label: "bg-blue-600 text-blue-100 text-base font-medium text-center p-1 leading-none rounded-full"
		},
		class: 'mb-8'
	});

	$$renderer.push(`<!----> `);

	Progressbar($$renderer, {
		progress,
		labelOutside: 'Without animation',
		labelInside: true,
		size: 'h-6',
		classes: {
			label: "bg-blue-600 text-blue-100 text-base font-medium text-center p-1 leading-none rounded-full"
		}
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		onclick: () => progress = `${Math.round(Math.random() * 100)}`,
		class: 'mt-8',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Randomize`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}