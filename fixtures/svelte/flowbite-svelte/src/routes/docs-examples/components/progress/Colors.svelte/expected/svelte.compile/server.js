import * as $ from 'svelte/internal/server';
import { Progressbar } from "flowbite-svelte";

export default function Colors($$renderer) {
	$$renderer.push(`<div class="my-4"><div class="mb-1 text-base font-medium dark:text-white">Gray</div> `);
	Progressbar($$renderer, { progress: '50', color: 'gray' });
	$$renderer.push(`<!----></div> <div class="my-4"><div class="mb-1 text-base font-medium text-blue-700 dark:text-blue-500">Blue</div> `);
	Progressbar($$renderer, { progress: '50', color: 'blue' });
	$$renderer.push(`<!----></div> <div class="my-4"><div class="mb-1 text-base font-medium text-red-700 dark:text-red-500">Red</div> `);
	Progressbar($$renderer, { progress: '50', color: 'red' });
	$$renderer.push(`<!----></div> <div class="my-4"><div class="mb-1 text-base font-medium text-green-700 dark:text-green-500">Green</div> `);
	Progressbar($$renderer, { progress: '50', color: 'green' });
	$$renderer.push(`<!----></div> <div class="mb-1 text-base font-medium text-yellow-700 dark:text-yellow-500">Yellow</div> <div class="my-4">`);
	Progressbar($$renderer, { progress: '50', color: 'yellow' });
	$$renderer.push(`<!----></div> <div class="mb-1 text-base font-medium text-indigo-700 dark:text-indigo-400">Indigo</div> <div class="my-4">`);
	Progressbar($$renderer, { progress: '50', color: 'indigo' });
	$$renderer.push(`<!----></div> <div class="mb-1 text-base font-medium text-purple-700 dark:text-purple-400">Purple</div> <div class="my-4">`);
	Progressbar($$renderer, { progress: '50', color: 'purple' });
	$$renderer.push(`<!----></div>`);
}