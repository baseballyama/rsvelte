import * as $ from 'svelte/internal/server';
import { Popover, Label, Input, Checkbox, Button } from "flowbite-svelte";
import { CheckOutline, CloseOutline } from "flowbite-svelte-icons";

export default function Password($$renderer) {
	const preventDefault = (fn) => {
		return function (event) {
			event.preventDefault();
			fn.call(this, event);
		};
	};

	const handler = () => {
		alert("Submitted!");
	};

	$$renderer.push(`<form class="mb-8"><div class="mb-6">`);

	Label($$renderer, {
		for: 'email',
		class: 'mb-2',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Your email`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);
	Input($$renderer, { type: 'email', id: 'email', placeholder: 'name@flowbite.com' });
	$$renderer.push(`<!----></div> <div class="mb-6">`);

	Label($$renderer, {
		for: 'password',
		class: 'mb-2',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Your password`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);
	Input($$renderer, { type: 'password', id: 'password' });
	$$renderer.push(`<!----></div> `);

	Checkbox($$renderer, {
		classes: { div: "mb-6" },
		children: ($$renderer) => {
			$$renderer.push(`<!---->Remember me`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		type: 'submit',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Submit`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></form> `);

	Popover($$renderer, {
		class: 'text-sm',
		triggeredBy: '#password',
		placement: 'bottom',
		children: ($$renderer) => {
			$$renderer.push(`<h3 class="font-semibold text-gray-900 dark:text-white">Must have at least 6 characters</h3> <div class="grid grid-cols-4 gap-2"><div class="h-1 bg-orange-300 dark:bg-orange-400"></div> <div class="h-1 bg-orange-300 dark:bg-orange-400"></div> <div class="h-1 bg-gray-200 dark:bg-gray-600"></div> <div class="h-1 bg-gray-200 dark:bg-gray-600"></div></div> <p class="py-2">It’s better to have:</p> <ul><li class="mb-1 flex items-center">`);
			CheckOutline($$renderer, { class: 'me-2 h-4 w-4 text-green-400 dark:text-green-500' });
			$$renderer.push(`<!----> Upper &amp; lower case letters</li> <li class="mb-1 flex items-center">`);
			CheckOutline($$renderer, { class: 'me-2 h-4 w-4 text-green-400 dark:text-green-500' });
			$$renderer.push(`<!----> A symbol (#$&amp;)</li> <li class="flex items-center">`);
			CloseOutline($$renderer, { class: 'me-2 h-4 w-4 text-gray-300 dark:text-gray-400' });
			$$renderer.push(`<!---->A longer password (min. 12 chars.)</li></ul>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}