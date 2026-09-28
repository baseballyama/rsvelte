import * as $ from 'svelte/internal/server';
import { ProgressStepper, Button, P, Heading, List, Li, Span } from "flowbite-svelte";
import { HomeOutline, CartOutline, DollarOutline, TruckOutline } from "flowbite-svelte-icons";

export default function ProgressOverride($$renderer) {
	let current = 1; // 1-based: 0=none, 1=first step, 2=second step, etc.

	// Example: Manual status override
	// This is useful when you want specific steps to have certain states
	// regardless of the current position
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

	const stepLabels = ["Browse Products", "Shopping Cart", "Payment", "Delivery"];
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Heading($$renderer, {
			tag: 'h3',
			class: 'mb-2 text-lg font-semibold',
			children: ($$renderer) => {
				$$renderer.push(`<!---->Progress Stepper with Status Override`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		ProgressStepper($$renderer, {
			steps,
			get current() {
				return current;
			},

			set current($$value) {
				current = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> <div class="mt-8 flex gap-4">`);

		Button($$renderer, {
			onclick: () => current = Math.max(0, current - 1),
			disabled: current === 0,
			class: 'rounded bg-gray-500 px-4 py-2 disabled:opacity-50',
			children: ($$renderer) => {
				$$renderer.push(`<!---->Previous`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Button($$renderer, {
			onclick: () => current = Math.min(steps.length, current + 1),
			disabled: current === steps.length,
			class: 'rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50',
			children: ($$renderer) => {
				$$renderer.push(`<!---->Next`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> <div class="mt-4 rounded bg-gray-50 p-4 dark:bg-gray-800">`);

		Heading($$renderer, {
			tag: 'h4',
			class: 'mb-2 font-bold',
			children: ($$renderer) => {
				$$renderer.push(`<!---->Current Step`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		P($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<strong>${$.escape(current === 0 ? "None (all pending)" : stepLabels[current - 1])}</strong> (Step ${$.escape(current)} of ${$.escape(steps.length)})`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Heading($$renderer, {
			tag: 'h4',
			class: 'mt-4 mb-2 font-bold',
			children: ($$renderer) => {
				$$renderer.push(`<!---->Step Statuses`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		List($$renderer, {
			tag: 'ul',
			class: 'space-y-1 text-gray-500 dark:text-gray-400',
			children: ($$renderer) => {
				$$renderer.push(`<!--[-->`);

				const each_array = $.ensure_array_like(steps);

				for (let i = 0, $$length = each_array.length; i < $$length; i++) {
					let step = each_array[i];

					Li($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->${$.escape(stepLabels[i])}: `);

							Span($$renderer, {
								class: 'font-mono',
								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape(step.status ?? (i + 1 < current
										? "completed"
										: i + 1 === current ? "current" : "pending"))}`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});
				}

				$$renderer.push(`<!--]-->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}