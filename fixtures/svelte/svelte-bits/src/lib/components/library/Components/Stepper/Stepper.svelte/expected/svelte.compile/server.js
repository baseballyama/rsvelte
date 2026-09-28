import * as $ from 'svelte/internal/server';
import { tick } from 'svelte';

export default function Stepper($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			steps,
			initialStep = 1,
			onStepChange,
			onFinalStepCompleted,
			stepCircleContainerClass = '',
			stepContainerClass = '',
			contentClass = '',
			footerClass = '',
			backButtonText = 'Back',
			nextButtonText = 'Continue',
			disableStepIndicators = false,
			accentColor = '#FF8A4C'
		} = $$props;

		let currentStep = initialStep;
		let direction = 0;
		let parentHeight = 0;
		let measureRef = null;
		const totalSteps = $.derived(() => steps.length);
		const isCompleted = $.derived(() => currentStep > totalSteps());
		const isLastStep = $.derived(() => currentStep === totalSteps());

		function updateStep(n) {
			currentStep = n;

			if (n > totalSteps()) onFinalStepCompleted?.(); else onStepChange?.(n);
		}

		function back() {
			if (currentStep > 1) {
				direction = -1;
				updateStep(currentStep - 1);
			}
		}

		function next() {
			if (!isLastStep()) {
				direction = 1;
				updateStep(currentStep + 1);
			}
		}

		function complete() {
			direction = 1;
			updateStep(totalSteps() + 1);
		}

		function goTo(n) {
			if (disableStepIndicators) return;
			if (n === currentStep) return;

			direction = n > currentStep ? 1 : -1;
			updateStep(n);
		}

		$$renderer.push(`<div class="flex min-h-full flex-1 flex-col items-center justify-center p-4 sm:aspect-[4/3] md:aspect-[2/1]"><div${$.attr_class(`mx-auto w-full max-w-md rounded-4xl shadow-xl ${stepCircleContainerClass}`, 'svelte-15qsqvs')} style="border:1px solid #222;"><div${$.attr_class(`${stepContainerClass} flex w-full items-center p-8`, 'svelte-15qsqvs')}><!--[-->`);

		const each_array = $.ensure_array_like(steps);

		for (let i = 0, $$length = each_array.length; i < $$length; i++) {
			let _ = each_array[i];
			const stepNumber = i + 1;

			const status = currentStep === stepNumber
				? 'active'
				: currentStep < stepNumber ? 'inactive' : 'complete';

			$$renderer.push(`<div${$.attr_class(`relative outline-none focus:outline-none ${disableStepIndicators ? 'pointer-events-none opacity-50' : 'cursor-pointer'}`, 'svelte-15qsqvs')} role="button" tabindex="0"><div class="flex h-8 w-8 items-center justify-center rounded-full font-semibold transition-[background-color,color] duration-300"${$.attr_style(status === 'inactive'
				? 'background:#222;color:#a3a3a3;'
				: `background:${accentColor};color:${accentColor};`)}>`);

			if (status === 'complete') {
				$$renderer.push(`<!--[0--><svg class="h-4 w-4 text-black" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path></svg>`);
			} else if (status === 'active') {
				$$renderer.push(`<!--[1--><div class="h-3 w-3 rounded-full bg-[#120F17]"></div>`);
			} else {
				$$renderer.push(`<!--[-1--><span class="text-sm">${$.escape(stepNumber)}</span>`);
			}

			$$renderer.push(`<!--]--></div></div> `);

			if (i < steps.length - 1) {
				$$renderer.push(`<!--[0--><div class="relative mx-2 h-0.5 flex-1 overflow-hidden rounded bg-neutral-600"><div class="absolute left-0 top-0 h-full transition-[width,background-color] duration-[400ms]"${$.attr_style(currentStep > stepNumber
					? `width:100%;background-color:${accentColor};`
					: 'width:0;background-color:transparent;')}></div></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		}

		$$renderer.push(`<!--]--></div> <div${$.attr_class(`space-y-2 px-8 ${contentClass}`, 'svelte-15qsqvs')}${$.attr_style(`position:relative;overflow:hidden;height:${$.stringify(isCompleted() ? 0 : parentHeight)}px;transition:height 0.4s cubic-bezier(0.5,1,0.5,1);`)}>`);

		if (!isCompleted()) {
			$$renderer.push(`<!--[0--><!---->`);

			{
				$$renderer.push(`<div${$.attr_style(`position:absolute;left:0;right:0;top:0;animation:stepper-enter 0.4s cubic-bezier(0.4,0,0.2,1) forwards;--enter-x:${direction >= 0 ? '-100%' : '100%'};`)}><div class="px-8">`);
				steps[currentStep - 1]?.($$renderer);
				$$renderer.push(`<!----></div></div>`);
			}

			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div> `);

		if (!isCompleted()) {
			$$renderer.push(`<!--[0--><div${$.attr_class(`px-8 pb-8 ${footerClass}`, 'svelte-15qsqvs')}><div${$.attr_class(`mt-10 flex ${currentStep !== 1 ? 'justify-between' : 'justify-end'}`, 'svelte-15qsqvs')}>`);

			if (currentStep !== 1) {
				$$renderer.push(`<!--[0--><button${$.attr_class(
					`duration-350 rounded px-2 py-1 transition ${currentStep === 1
						? 'pointer-events-none opacity-50 text-neutral-400'
						: 'text-neutral-400 hover:text-neutral-700'}`,
					'svelte-15qsqvs'
				)}>${$.escape(backButtonText)}</button>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> <button class="next-button duration-350 flex items-center justify-center rounded-full py-1.5 px-3.5 font-medium tracking-tight transition svelte-15qsqvs">${$.escape(isLastStep() ? 'Complete' : nextButtonText)}</button></div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div></div>`);
	});
}