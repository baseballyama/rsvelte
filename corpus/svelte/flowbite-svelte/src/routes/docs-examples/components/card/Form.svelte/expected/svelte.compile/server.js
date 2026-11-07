import * as $ from 'svelte/internal/server';
import { Card, Button, Label, Input, Checkbox } from "flowbite-svelte";

export default function Form($$renderer) {
	Card($$renderer, {
		class: 'p-4 sm:p-6 md:p-8',
		children: ($$renderer) => {
			$$renderer.push(`<form class="flex flex-col space-y-6" action="/"><h3 class="text-xl font-medium text-gray-900 dark:text-white">Sign in to our platform</h3> `);

			Label($$renderer, {
				class: 'space-y-2',
				children: ($$renderer) => {
					$$renderer.push(`<span>Email</span> `);

					Input($$renderer, {
						type: 'email',
						name: 'email',
						placeholder: 'name@company.com',
						required: true
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Label($$renderer, {
				class: 'space-y-2',
				children: ($$renderer) => {
					$$renderer.push(`<span>Your password</span> `);

					Input($$renderer, {
						type: 'password',
						name: 'password',
						placeholder: '•••••',
						required: true
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <div class="flex items-start">`);

			Checkbox($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Remember me`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <a href="/" class="text-primary-700 dark:text-primary-500 ms-auto text-sm hover:underline">Lost password?</a></div> `);

			Button($$renderer, {
				type: 'submit',
				class: 'w-full',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Login to your account`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <div class="text-sm font-medium text-gray-500 dark:text-gray-300">Not registered? <a href="/" class="text-primary-700 dark:text-primary-500 hover:underline">Create account</a></div></form>`);
		},
		$$slots: { default: true }
	});
}