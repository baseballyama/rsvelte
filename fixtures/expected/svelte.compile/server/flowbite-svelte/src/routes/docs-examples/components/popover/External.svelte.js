import * as $ from 'svelte/internal/server';
import { Popover, Button } from "flowbite-svelte";

export default function External($$renderer) {
	$$renderer.push(`<div id="ext-ref" class="my-4 rounded-lg border border-gray-200 p-2 dark:border-gray-600">External reference</div> <div class="space-x-4 rtl:space-x-reverse">`);

	Button($$renderer, {
		id: 'ref-1',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Left`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		id: 'ref-2',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Top`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		id: 'ref-3',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Right`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div> `);

	Popover($$renderer, {
		reference: '#ext-ref',
		triggeredBy: '#ref-1',
		class: 'w-64 text-sm font-light ',
		placement: 'left',
		title: 'Placement: Left',
		children: ($$renderer) => {
			$$renderer.push(`<!---->And here's some amazing content. It's very engaging. Right?`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Popover($$renderer, {
		reference: '#ext-ref',
		triggeredBy: '#ref-2',
		class: 'w-64 text-sm font-light ',
		placement: 'top',
		title: 'Placement: Top',
		children: ($$renderer) => {
			$$renderer.push(`<!---->And here's some amazing content. It's very engaging. Right?`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Popover($$renderer, {
		reference: '#ext-ref',
		triggeredBy: '#ref-3',
		class: 'w-64 text-sm font-light ',
		placement: 'right',
		title: 'Placement: Right',
		children: ($$renderer) => {
			$$renderer.push(`<!---->And here's some amazing content. It's very engaging. Right?`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}