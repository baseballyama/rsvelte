import * as $ from 'svelte/internal/server';
import { StepIndicator } from "flowbite-svelte";

export default function NonClickable($$renderer) {
	let currentStep = 3;
	const steps = ["Step 1", "Step 2", "Step 3", "Step 4", "Step 5"];
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div class="space-y-4">`);

		StepIndicator($$renderer, {
			steps,
			clickable: false,
			get currentStep() {
				return currentStep;
			},

			set currentStep($$value) {
				currentStep = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> <p class="text-sm text-gray-500 dark:text-gray-400">Step indicators are non-clickable when <code class="text-xs">clickable={false}</code> is set.</p></div>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}