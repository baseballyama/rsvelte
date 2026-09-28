import * as $ from 'svelte/internal/server';
import { StepIndicator, Button } from "flowbite-svelte";

export default function Clickable($$renderer) {
	let currentStep = 1;
	const steps = ["Step 1", "Step 2", "Step 3", "Step 4", "Step 5"];

	function handleStepClick({ current, last }) {
		console.log(`Navigated from step ${last} to step ${current}`);
	}

	function next() {
		if (currentStep < steps.length) {
			currentStep++;
		}
	}

	function prev() {
		if (currentStep > 1) {
			currentStep--;
		}
	}

	function reset() {
		currentStep = 1;
	}

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div class="space-y-6">`);

		StepIndicator($$renderer, {
			steps,
			onStepClick: handleStepClick,
			get currentStep() {
				return currentStep;
			},

			set currentStep($$value) {
				currentStep = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> <div class="flex gap-2">`);

		Button($$renderer, {
			onclick: prev,
			disabled: currentStep === 1,
			children: ($$renderer) => {
				$$renderer.push(`<!---->Previous`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Button($$renderer, {
			onclick: next,
			disabled: currentStep === steps.length,
			children: ($$renderer) => {
				$$renderer.push(`<!---->Next`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Button($$renderer, {
			onclick: reset,
			color: 'alternative',
			children: ($$renderer) => {
				$$renderer.push(`<!---->Reset`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> <p class="text-sm text-gray-500 dark:text-gray-400">Click on any step indicator to navigate directly to that step.</p></div>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}