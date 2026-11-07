import * as $ from 'svelte/internal/server';
import { DetailedStepper, Button, P, Heading } from "flowbite-svelte";

export default function DetailedBasic($$renderer) {
	let current = 1;

	const steps = [
		{
			id: 1,
			label: "Account Info",
			description: "Enter your account details"
		},

		{
			id: 2,
			label: "Company Info",
			description: "Provide company information"
		},
		{ id: 3, label: "Review", description: "Review and submit" },
		{ id: 4, label: "Review 2", description: "Review and submit 2" },
		{ id: 5, label: "Review 3", description: "Review and submit 3" }
	];

	// Optional: Handle step changes
	function handleStepChange(event) {
		console.log(`Moved from step ${event.last} to step ${event.current}`);

		// You can add validation here
	}

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Heading($$renderer, {
			tag: 'h3',
			class: 'mb-2 text-lg font-semibold',
			children: ($$renderer) => {
				$$renderer.push(`<!---->Example 1: Basic usage (no icons)`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		DetailedStepper($$renderer, {
			steps,
			onStepClick: handleStepChange,
			get current() {
				return current;
			},

			set current($$value) {
				current = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> `);

		Heading($$renderer, {
			tag: 'h3',
			class: 'mt-8 mb-2 text-lg font-semibold',
			children: ($$renderer) => {
				$$renderer.push(`<!---->Example 2: Non-clickable stepper`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		DetailedStepper($$renderer, {
			steps,
			clickable: false,
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
			class: 'font-bold',
			children: ($$renderer) => {
				$$renderer.push(`<!---->Current State`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		P($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<strong>current =</strong> ${$.escape(current)}`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		P($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<strong>Display as:</strong> Step ${$.escape(current)} of ${$.escape(steps.length)}`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		P($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<strong>Active Step:</strong> ${$.escape(current === 0 ? "None (all pending)" : steps[current - 1].label)}`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		P($$renderer, {
			class: 'mt-2 text-xs text-gray-500',
			children: ($$renderer) => {
				$$renderer.push(`<!---->Note: current=0 means no step is active, current=1 is the first step, current=2 is the second step, etc.`);
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