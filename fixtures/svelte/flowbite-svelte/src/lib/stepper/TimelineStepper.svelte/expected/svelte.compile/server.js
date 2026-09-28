import * as $ from 'svelte/internal/server';
import CheckmarkIcon from "./CheckmarkIcon.svelte";
import ProfileCardIcon from "./ProfileCardIcon.svelte";
import { timelineStepper } from "./theme";
import clsx from "clsx";
import { getTheme } from "$lib/theme/themeUtils";

export default function TimelineStepper($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			steps = [],
			class: className,
			classes,
			contentClass,
			current = 1,
			clickable = true,
			showCheckmarkForCompleted = true,
			onStepClick,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		// Ensure current is within valid bounds
		const theme = $.derived(() => getTheme("timelineStepper"));

		const $$d = $.derived(timelineStepper),
			base = $.derived(() => $$d().base),
			item = $.derived(() => $$d().item),
			circle = $.derived(() => $$d().circle);

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

		function stepIcon($$renderer, status, step) {
			if (status === "completed" && showCheckmarkForCompleted) {
				$$renderer.push('<!--[0-->');
				CheckmarkIcon($$renderer, { class: 'h-3.5 w-3.5 text-green-500 dark:text-green-400' });
			} else if (step.icon) {
				$$renderer.push('<!--[1-->');

				if (step.icon) {
					$$renderer.push('<!--[-->');
					step.icon($$renderer, { class: clsx(step.iconClass) || "h-3.5 w-3.5" });
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			} else {
				$$renderer.push('<!--[-1-->');
				ProfileCardIcon($$renderer, {});
			}

			$$renderer.push(`<!--]-->`);
		}

		$$renderer.push(`<ol${$.attributes({
			class: $.clsx(base()({ class: clsx(theme()?.base, className) })),
			...restProps
		})}><!--[-->`);

		const each_array = $.ensure_array_like(steps);

		for (let index = 0, $$length = each_array.length; index < $$length; index++) {
			let step = each_array[index];
			const status = step.status ?? getStepStatus(index);

			$$renderer.push(`<li${$.attr_class($.clsx(item()({
				isLast: index === steps.length - 1,
				class: clsx(theme()?.item, classes?.item)
			})))}>`);

			if (clickable) {
				$$renderer.push(`<!--[0--><button type="button"${$.attr_class(`absolute -start-4 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full ring-4 ring-white transition-opacity hover:opacity-75 dark:ring-gray-900 ${$.stringify(circle()({ status, class: clsx(theme()?.circle, classes?.circle) }))}`)}${$.attr('aria-current', status === "current" ? "step" : undefined)}>`);
				stepIcon($$renderer, status, step);
				$$renderer.push(`<!----></button>`);
			} else {
				$$renderer.push(`<!--[-1--><span${$.attr_class($.clsx(circle()({ status, class: clsx(theme()?.circle, classes?.circle) })))}${$.attr('aria-current', status === "current" ? "step" : undefined)}>`);
				stepIcon($$renderer, status, step);
				$$renderer.push(`<!----></span>`);
			}

			$$renderer.push(`<!--]--> <div${$.attr_class($.clsx(clsx(contentClass)))}><h3 class="leading-tight font-medium">${$.escape(step.label)}</h3> `);

			if (step.description) {
				$$renderer.push(`<!--[0--><p class="text-sm">${$.escape(step.description)}</p>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div></li>`);
		}

		$$renderer.push(`<!--]--></ol>`);
		$.bind_props($$props, { current });
	});
}