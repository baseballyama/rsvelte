import * as $ from 'svelte/internal/server';
import { Progressbar } from "flowbite-svelte";

export default function CustomColor($$renderer) {
	$$renderer.push(`<div class="space-y-4">`);

	Progressbar($$renderer, {
		progress: '40',
		classes: { label: "bg-sky-600 dark:bg-sky-400" }
	});

	$$renderer.push(`<!----> `);

	Progressbar($$renderer, {
		progress: '40',
		classes: { label: "bg-lime-600 dark:bg-lime-400" }
	});

	$$renderer.push(`<!----> `);

	Progressbar($$renderer, {
		progress: '40',
		classes: { label: "bg-pink-600 dark:bg-pink-400" }
	});

	$$renderer.push(`<!----></div>`);
}