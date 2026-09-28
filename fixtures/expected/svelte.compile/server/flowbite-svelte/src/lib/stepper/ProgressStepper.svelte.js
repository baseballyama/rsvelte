import * as $ from 'svelte/internal/server';
import CheckmarkIcon from "./CheckmarkIcon.svelte";
import { progressStepper } from "./theme";
import clsx from "clsx";
import { getTheme } from "$lib/theme/themeUtils";
import { Tween } from "svelte/motion";
import { cubicOut } from "svelte/easing";

export default function ProgressStepper($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			steps = [],
			class: className,
			classes,
			current = 0,
			clickable = true,
			showCheckmarkForCompleted = true,
			onStepClick,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		// Ensure current is within valid bounds
		// Animated progress with Tween
		const animatedProgress = new Tween(0, { duration: 100, easing: cubicOut });

		// Update animated progress when current changes
		const theme = $.derived(() => getTheme("progressStepper"));

		const $$d = $.derived(progressStepper),
			base = $.derived(() => $$d().base),
			item = $.derived(() => $$d().item),
			circle = $.derived(() => $$d().circle),
			line = $.derived(() => $$d().line),
			progressLine = $.derived(() => $$d().progressLine);

		// Handle step click
		function handleStepClick(stepIndex) {
			if (clickable && stepIndex < steps.length) {
				const last = current;

				// Convert 0-based array index to 1-based current value
				current = stepIndex + 1;

				// Call custom onStepClick if provided
				if (onStepClick) {
					onStepClick({ current, last });
				}
			}
		}

		// Determine step status - reactive to current changes
		// current = 0: no items highlighted (all pending)
		// current = 1: first item is current
		// current = 2: first is completed, second is current
		function getStepStatus(stepIndex) {
			if (current === 0) {
				return "pending";
			}

			if (stepIndex < current - 1) {
				return "completed";
			} else if (stepIndex === current - 1) {
				return "current";
			} else {
				return "pending";
			}
		}

		// Calculate line positions and progress
		// Lines should start from center of first circle and end at center of last circle
		const lineStart = $.derived(() => steps.length <= 1 ? "0" : `${1 / steps.length * 50}%`);

		const lineWidth = $.derived(() => steps.length <= 1 ? "0" : `${100 - 1 / steps.length * 100}%`);

		// Calculate progress width using animated value
		const progressWidth = $.derived(() => steps.length <= 1 || lineWidth() === "0"
			? "0"
			: `${animatedProgress.current / 100 * parseFloat(lineWidth())}%`);

		$$renderer.push(`<ol${$.attributes({
			class: $.clsx(base()({ class: clsx(theme()?.base, className) })),
			...restProps
		})}><div${$.attr_class($.clsx(line()({ class: clsx(theme()?.line, classes?.line) })))}${$.attr_style(`left: ${lineStart()}; width: ${lineWidth()}`)} aria-hidden="true"></div> <div${$.attr_class($.clsx(progressLine()({ class: clsx(theme()?.progressLine, classes?.progressLine) })))}${$.attr_style(`left: ${lineStart()}; width: ${progressWidth()}`)} aria-hidden="true"></div> <!--[-->`);

		const each_array = $.ensure_array_like(steps);

		for (let index = 0, $$length = each_array.length; index < $$length; index++) {
			let step = each_array[index];
			const status = step.status ?? getStepStatus(index);

			$$renderer.push(`<li${$.attr_class($.clsx(item()({ status, class: clsx(theme()?.item, classes?.item) })))}>`);

			if (clickable) {
				$$renderer.push(`<!--[0--><button type="button"${$.attr_class($.clsx(circle()({
					status,
					class: clsx(theme()?.circle, classes?.circle, "cursor-pointer transition-all hover:brightness-110")
				})))}${$.attr('aria-current', status === "current" ? "step" : undefined)}>`);

				if (status === "completed" && showCheckmarkForCompleted) {
					$$renderer.push('<!--[0-->');
					CheckmarkIcon($$renderer, { variant: 'tick' });
				} else if (step.icon) {
					$$renderer.push('<!--[1-->');

					if (step.icon) {
						$$renderer.push('<!--[-->');
						step.icon($$renderer, { class: clsx(step.iconClass) || "h-5 w-5 lg:h-6 lg:w-6" });
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
				} else {
					$$renderer.push(`<!--[-1--><span class="text-sm font-semibold">${$.escape(step.id)}</span>`);
				}

				$$renderer.push(`<!--]--></button>`);
			} else {
				$$renderer.push(`<!--[-1--><span${$.attr_class($.clsx(circle()({ status, class: clsx(theme()?.circle, classes?.circle) })))}${$.attr('aria-current', status === "current" ? "step" : undefined)}>`);

				if (status === "completed" && showCheckmarkForCompleted) {
					$$renderer.push('<!--[0-->');
					CheckmarkIcon($$renderer, { variant: 'tick' });
				} else if (step.icon) {
					$$renderer.push('<!--[1-->');

					if (step.icon) {
						$$renderer.push('<!--[-->');
						step.icon($$renderer, { class: clsx(step.iconClass) || "h-5 w-5 lg:h-6 lg:w-6" });
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
				} else {
					$$renderer.push(`<!--[-1--><span class="text-sm font-semibold">${$.escape(step.id)}</span>`);
				}

				$$renderer.push(`<!--]--></span>`);
			}

			$$renderer.push(`<!--]--></li>`);
		}

		$$renderer.push(`<!--]--></ol>`);
		$.bind_props($$props, { current });
	});
}