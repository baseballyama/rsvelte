import * as $ from 'svelte/internal/server';
import { ProgressStepper, Label, Input, Button } from "flowbite-svelte";
import { HomeOutline, CartOutline, DollarOutline, TruckOutline } from "flowbite-svelte-icons";

export default function Form($$renderer) {
	let current = 2;

	const steps = [
		{
			id: 1,
			icon: HomeOutline,
			status: "completed", // Explicitly completed
			iconClass: "h-5 w-5 lg:h-6 lg:w-6"
		},

		{
			id: 2,
			icon: CartOutline,
			// status will be auto-determined based on current
			iconClass: "h-5 w-5 lg:h-6 lg:w-6"
		},

		{
			id: 3,
			icon: DollarOutline,
			// status will be auto-determined based on current
			iconClass: "h-5 w-5 lg:h-6 lg:w-6"
		},

		{
			id: 4,
			icon: TruckOutline,
			status: "pending", // Force pending regardless of current
			iconClass: "h-5 w-5 lg:h-6 lg:w-6"
		}
	];

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		ProgressStepper($$renderer, {
			steps,
			class: 'mb-8',
			clickable: false,
			get current() {
				return current;
			},

			set current($$value) {
				current = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> <form action="#"><h3 class="mb-4 text-lg leading-none font-medium text-gray-900 dark:text-white">Invoice details</h3> <div class="mb-4 grid gap-4 sm:grid-cols-2"><div>`);

		Label($$renderer, {
			for: 'username',
			class: 'mb-2',
			children: ($$renderer) => {
				$$renderer.push(`<!---->Username`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Input($$renderer, {
			type: 'text',
			name: 'username',
			id: 'username',
			placeholder: 'username.example',
			required: true
		});

		$$renderer.push(`<!----></div> <div>`);

		Label($$renderer, {
			for: 'email',
			class: 'mb-2 block text-sm font-medium text-gray-900 dark:text-white',
			children: ($$renderer) => {
				$$renderer.push(`<!---->Email`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Input($$renderer, {
			type: 'email',
			name: 'email',
			id: 'email',
			placeholder: 'name@company.com',
			required: true
		});

		$$renderer.push(`<!----></div> <div>`);

		Label($$renderer, {
			for: 'password',
			class: 'mb-2 block text-sm font-medium text-gray-900 dark:text-white',
			children: ($$renderer) => {
				$$renderer.push(`<!---->Password`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Input($$renderer, {
			type: 'password',
			name: 'password',
			id: 'password',
			placeholder: '•••••••••',
			required: true
		});

		$$renderer.push(`<!----></div> <div>`);

		Label($$renderer, {
			for: 'confirm-password',
			class: 'mb-2 block text-sm font-medium text-gray-900 dark:text-white',
			children: ($$renderer) => {
				$$renderer.push(`<!---->Confirm password`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Input($$renderer, {
			type: 'password',
			name: 'confirm-password',
			id: 'confirm-password',
			placeholder: '•••••••••',
			required: true
		});

		$$renderer.push(`<!----></div></div> `);

		Button($$renderer, {
			type: 'submit',
			children: ($$renderer) => {
				$$renderer.push(`<!---->Next Step: Payment Info`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></form>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}