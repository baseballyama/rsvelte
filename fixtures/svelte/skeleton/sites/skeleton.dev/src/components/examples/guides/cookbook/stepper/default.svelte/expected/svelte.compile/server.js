import * as $ from 'svelte/internal/server';
import ArrowLeftIcon from '@lucide/svelte/icons/arrow-left';
import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';

export default function Default($$renderer) {
	// Source Data
	const steps = [
		{ label: 'Step 1', description: 'The description of step 1.' },
		{ label: 'Step 2', description: 'The description of step 2.' },
		{ label: 'Step 3', description: 'The description of step 3.' },
		{ label: 'Step 4', description: 'The description of step 4.' },
		{ label: 'Step 5', description: 'The description of step 5.' }
	];

	// Reactive
	let currentStep = 0;

	const isFirstStep = $.derived(() => currentStep === 0);
	const isLastStep = $.derived(() => currentStep === steps.length - 1);

	/** Determine if on the current step. */
	function isCurrentStep(index) {
		return currentStep === index;
	}

	/** Jump to a particular step. */
	function setStep(index) {
		currentStep = index;
	}

	/** Progress to the previous step. */
	function prevStep() {
		currentStep--;
	}

	/** Progress to the next step. */
	function nextStep() {
		currentStep++;
	}

	$$renderer.push(`<div class="w-full"><div class="space-y-8"><div class="relative"><div class="flex justify-between items-center gap-4"><!--[-->`);

	const each_array = $.ensure_array_like(steps);

	for (let i = 0, $$length = each_array.length; i < $$length; i++) {
		let step = each_array[i];

		$$renderer.push(`<button${$.attr_class(`btn-icon btn-icon-sm rounded-full ${isCurrentStep(i)
			? 'preset-filled-primary-500'
			: 'preset-filled-surface-200-800'}`)}${$.attr('title', `Go to ${$.stringify(step.label)}`)}${$.attr('aria-label', `Go to ${$.stringify(step.label)}`)}><span class="font-bold">${$.escape(i + 1)}</span></button>`);
	}

	$$renderer.push(`<!--]--></div> <hr class="hr !border-surface-200-800 absolute top-[50%] left-0 right-0 z-[-1]"/></div> <!--[-->`);

	const each_array_1 = $.ensure_array_like(steps);

	for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
		let step = each_array_1[i];

		if (isCurrentStep(i)) {
			$$renderer.push(`<!--[0--><div class="card bg-surface-100-900 p-10 space-y-2 text-center"><h2 class="h3">${$.escape(step.label)}</h2> <p>${$.escape(step.description)}</p></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	}

	$$renderer.push(`<!--]--> <nav class="flex justify-between items-center gap-4"><button type="button" class="btn preset-tonal hover:preset-filled"${$.attr('disabled', isFirstStep(), true)}>`);
	ArrowLeftIcon($$renderer, { size: 18 });
	$$renderer.push(`<!----> <span>Previous</span></button> <button type="button" class="btn preset-tonal hover:preset-filled"${$.attr('disabled', isLastStep(), true)}><span>Next</span> `);
	ArrowRightIcon($$renderer, { size: 18 });
	$$renderer.push(`<!----></button></nav></div></div>`);
}