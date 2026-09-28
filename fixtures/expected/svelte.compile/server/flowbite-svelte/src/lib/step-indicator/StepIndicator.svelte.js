import * as $ from 'svelte/internal/server';
import clsx from "clsx";
import { stepIndicator, getStepStateClasses } from "./theme";
import { getTheme } from "$lib/theme/themeUtils";

export default function StepIndicator($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			steps = ["Step 1", "Step 2", "Step 3", "Step 4", "Step 5"],
			currentStep = 1,
			size = "md",
			color = "primary",
			glow = false,
			hideLabel = false,
			clickable = true,
			completedCustom = "",
			currentCustom = "",
			onStepClick,
			class: className,
			classes,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const theme = $.derived(() => getTheme("stepIndicator"));

		const $$d = $.derived(() => stepIndicator({ size, color, glow, hideLabel })),
			base = $.derived(() => $$d().base),
			label = $.derived(() => $$d().label),
			container = $.derived(() => $$d().container),
			wrapper = $.derived(() => $$d().wrapper),
			stepCls = $.derived(() => $$d().step),
			stepGlow = $.derived(() => $$d().glow),
			incomplete = $.derived(() => $$d().incomplete);

		// Ensure currentStep is within bounds
		let safeCurrentStep = $.derived(() => Math.max(1, Math.min(currentStep, steps.length)));

		let currentStepLabel = $.derived(() => steps[safeCurrentStep() - 1] ?? "Unknown Step");

		// Handle step click
		function handleStepClick(stepIndex) {
			if (!clickable || stepIndex < 0 || stepIndex >= steps.length) return;

			const next = stepIndex + 1;

			if (next === currentStep) return;

			const last = currentStep;

			currentStep = next;

			if (onStepClick) {
				onStepClick({ current: currentStep, last });
			}
		}

		// Handle custom colors if provided
		const getCustomStepClass = (stepIndex) => {
			if (color !== "custom") return "";

			if (stepIndex === currentStep - 1) {
				return currentCustom;
			} else if (stepIndex < currentStep - 1) {
				return completedCustom;
			}

			return "";
		};

		$$renderer.push(`<div${$.attributes({
			...restProps,
			class: $.clsx(base()({ class: clsx(theme()?.base, className) }))
		})}>`);

		if (!hideLabel) {
			$$renderer.push(`<!--[0--><h3${$.attr_class($.clsx(label()({ class: clsx(theme()?.label, classes?.label) })))}>${$.escape(currentStepLabel())}</h3>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <div${$.attr_class($.clsx(container()({ class: clsx(theme()?.container, classes?.container) })))}><!--[-->`);

		const each_array = $.ensure_array_like(steps);

		for (let i = 0, $$length = each_array.length; i < $$length; i++) {
			let _step = each_array[i];

			if (clickable) {
				$$renderer.push('<!--[0-->');

				if (i === currentStep - 1) {
					$$renderer.push(`<!--[0--><button type="button"${$.attr_class($.clsx(wrapper()({
						class: clsx(theme()?.wrapper, classes?.wrapper, "cursor-pointer transition-opacity hover:opacity-75")
					})))} aria-current="step"${$.attr('aria-label', `Current step: ${steps[i]}`)}><div${$.attr_class($.clsx(stepCls()({
						class: clsx(getStepStateClasses(i, currentStep), getCustomStepClass(i), theme()?.step, classes?.step)
					})))} data-state="current"></div> `);

					if (glow) {
						$$renderer.push(`<!--[0--><div${$.attr_class($.clsx(stepGlow()({
							class: clsx(getCustomStepClass(i), theme()?.glow, classes?.glow)
						})))}></div>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--></button>`);
				} else if (i < currentStep - 1) {
					$$renderer.push(`<!--[1--><button type="button"${$.attr('aria-label', `Go to ${steps[i]} (completed)`)}${$.attr_class($.clsx(stepCls()({
						class: clsx(getStepStateClasses(i, currentStep), getCustomStepClass(i), theme()?.step, classes?.step, "cursor-pointer transition-opacity hover:opacity-75")
					})))} data-state="completed"></button>`);
				} else {
					$$renderer.push(`<!--[-1--><button type="button"${$.attr('aria-label', `Go to ${steps[i]}`)}${$.attr_class($.clsx(incomplete()({
						class: clsx(theme()?.incomplete, classes?.incomplete, "cursor-pointer transition-opacity hover:opacity-75")
					})))} data-state="incomplete"></button>`);
				}

				$$renderer.push(`<!--]-->`);
			} else if (i === currentStep - 1) {
				$$renderer.push(`<!--[1--><div${$.attr_class($.clsx(wrapper()({ class: clsx(theme()?.wrapper, classes?.wrapper) })))}><div${$.attr_class($.clsx(stepCls()({
					class: clsx(getStepStateClasses(i, currentStep), getCustomStepClass(i), theme()?.step, classes?.step)
				})))} data-state="current"></div> `);

				if (glow) {
					$$renderer.push(`<!--[0--><div${$.attr_class($.clsx(stepGlow()({
						class: clsx(getCustomStepClass(i), theme()?.glow, classes?.glow)
					})))}></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></div>`);
			} else if (i < currentStep - 1) {
				$$renderer.push(`<!--[2--><div${$.attr_class($.clsx(stepCls()({
					class: clsx(getStepStateClasses(i, currentStep), getCustomStepClass(i), theme()?.step, classes?.step)
				})))} data-state="completed"></div>`);
			} else {
				$$renderer.push(`<!--[-1--><div${$.attr_class($.clsx(incomplete()({ class: clsx(theme()?.incomplete, classes?.incomplete) })))} data-state="incomplete"></div>`);
			}

			$$renderer.push(`<!--]-->`);
		}

		$$renderer.push(`<!--]--></div></div>`);
		$.bind_props($$props, { currentStep, size, color });
	});
}