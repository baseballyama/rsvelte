import * as $ from 'svelte/internal/server';
import { Card, Button } from "flowbite-svelte";
import { CheckCircleSolid } from "flowbite-svelte-icons";

export default function Pricing($$renderer) {
	Card($$renderer, {
		class: 'p-4 sm:p-8 md:p-10',
		children: ($$renderer) => {
			$$renderer.push(`<h5 class="mb-4 text-xl font-medium text-gray-500 dark:text-gray-400">Standard plan</h5> <div class="flex items-baseline text-gray-900 dark:text-white"><span class="text-3xl font-semibold">$</span> <span class="text-5xl font-extrabold tracking-tight">49</span> <span class="ms-1 text-xl font-normal text-gray-500 dark:text-gray-400">/month</span></div> <ul class="my-7 space-y-4"><li class="flex space-x-2 rtl:space-x-reverse">`);
			CheckCircleSolid($$renderer, { class: 'text-primary-600 dark:text-primary-500 h-4 w-4' });
			$$renderer.push(`<!----> <span class="text-base leading-tight font-normal text-gray-500 dark:text-gray-400">2 team members</span></li> <li class="flex space-x-2 rtl:space-x-reverse">`);
			CheckCircleSolid($$renderer, { class: 'text-primary-600 dark:text-primary-500 h-4 w-4' });
			$$renderer.push(`<!----> <span class="text-base leading-tight font-normal text-gray-500 dark:text-gray-400">20GB Cloud storage</span></li> <li class="flex space-x-2 rtl:space-x-reverse">`);
			CheckCircleSolid($$renderer, { class: 'text-primary-600 dark:text-primary-500 h-4 w-4' });
			$$renderer.push(`<!----> <span class="text-base leading-tight font-normal text-gray-500 dark:text-gray-400">Integration help</span></li> <li class="flex space-x-2 line-through decoration-gray-500 rtl:space-x-reverse">`);
			CheckCircleSolid($$renderer, { class: 'h-4 w-4 text-gray-400 dark:text-gray-500' });
			$$renderer.push(`<!----> <span class="text-base leading-tight font-normal text-gray-500">Sketch Files</span></li> <li class="flex space-x-2 line-through decoration-gray-500 rtl:space-x-reverse">`);
			CheckCircleSolid($$renderer, { class: 'h-4 w-4 text-gray-400 dark:text-gray-500' });
			$$renderer.push(`<!----> <span class="text-base leading-tight font-normal text-gray-500">API Access</span></li> <li class="flex space-x-2 line-through decoration-gray-500 rtl:space-x-reverse">`);
			CheckCircleSolid($$renderer, { class: 'h-4 w-4 text-gray-400 dark:text-gray-500' });
			$$renderer.push(`<!----> <span class="text-base leading-tight font-normal text-gray-500">Complete documentation</span></li> <li class="flex space-x-2 line-through decoration-gray-500 rtl:space-x-reverse">`);
			CheckCircleSolid($$renderer, { class: 'h-4 w-4 text-gray-400 dark:text-gray-500' });
			$$renderer.push(`<!----> <span class="text-base leading-tight font-normal text-gray-500">24×7 phone &amp; email support</span></li></ul> `);

			Button($$renderer, {
				class: 'w-full',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Choose plan`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}