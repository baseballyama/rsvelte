import * as $ from 'svelte/internal/server';
import { Progressbar } from "flowbite-svelte";

export default function Sizes($$renderer) {
	$$renderer.push(`<div class="my-4"><div class="mb-1 text-base font-medium dark:text-white">Small</div> `);
	Progressbar($$renderer, { progress: '50', size: 'h-1.5' });
	$$renderer.push(`<!----></div> <div class="my-4"><div class="mb-1 text-base font-medium dark:text-white">Default</div> `);
	Progressbar($$renderer, { progress: '50', size: 'h-2.5' });
	$$renderer.push(`<!----></div> <div class="my-4"><div class="mb-1 text-lg font-medium dark:text-white">Large</div> `);
	Progressbar($$renderer, { progress: '50', size: 'h-4' });
	$$renderer.push(`<!----></div> <div class="my-4"><div class="mb-1 text-lg font-medium dark:text-white">Extra Large</div> `);
	Progressbar($$renderer, { progress: '50', size: 'h-6' });
	$$renderer.push(`<!----></div>`);
}