import * as $ from 'svelte/internal/server';
import CheckmarkIcon from "./CheckmarkIcon.svelte";
import { stepper } from "./theme";
import clsx from "clsx";
import { getTheme } from "$lib/theme/themeUtils";

export default function Stepper($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			steps = [],
			class: className,
			classes,
			current = 1,
			clickable = true,
			showCheckmarkForCompleted = true,
			onStepClick,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		// Ensure current is within valid bounds
		const theme = $.derived(() => getTheme("stepper"));

		const $$d = $.derived(stepper),
			base = $.derived(() => $$d().base),
			item = $.derived(() => $$d().item),
			content = $.derived(() => $$d().content);

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

		function stepContent($$renderer, step, status, index) {
			if (status === "completed" && showCheckmarkForCompleted) {
				$$renderer.push('<!--[0-->');
				CheckmarkIcon($$renderer, {});
			} else if (step.icon) {
				$$renderer.push('<!--[1-->');

				if (step.icon) {
					$$renderer.push('<!--[-->');

					step.icon($$renderer, {
						class: clsx(step.iconClass) || "me-2.5 h-3.5 w-3.5 sm:h-4 sm:w-4"
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			} else {
				$$renderer.push(`<!--[-1--><span class="me-2">${$.escape(step.id || index + 1)}</span>`);
			}

			$$renderer.push(`<!--]--> ${$.escape(step.label)} `);

			if (step.description) {
				$$renderer.push(`<!--[0--><span${$.attr_class($.clsx(clsx(step.descriptionClass) || "hidden sm:ms-2 sm:inline-flex"))}>${$.escape(step.description)}</span>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		}

		$$renderer.push(`<ol${$.attributes({
			...restProps,
			class: $.clsx(base()({ class: clsx(theme()?.base, className) }))
		})}><!--[-->`);

		const each_array = $.ensure_array_like(steps);

		for (let index = 0, $$length = each_array.length; index < $$length; index++) {
			let step = each_array[index];
			const status = step.status ?? getStepStatus(index);

			$$renderer.push(`<li${$.attr_class($.clsx(item()({
				status,
				isLast: index === steps.length - 1,
				class: clsx(theme()?.item, classes?.item)
			})))}>`);

			if (clickable) {
				$$renderer.push(`<!--[0--><button type="button"${$.attr_class($.clsx(content()({
					status,
					isLast: index === steps.length - 1,
					class: clsx(theme()?.content, classes?.content, "w-full cursor-pointer text-left transition-opacity hover:opacity-75")
				})))}${$.attr('aria-current', status === "current" ? "step" : undefined)}>`);

				stepContent($$renderer, step, status, index);
				$$renderer.push(`<!----></button>`);
			} else {
				$$renderer.push(`<!--[-1--><span${$.attr_class($.clsx(content()({
					status,
					isLast: index === steps.length - 1,
					class: clsx(theme()?.content, classes?.content)
				})))}>`);

				stepContent($$renderer, step, status, index);
				$$renderer.push(`<!----></span>`);
			}

			$$renderer.push(`<!--]--></li>`);
		}

		$$renderer.push(`<!--]--></ol>`);
		$.bind_props($$props, { current });
	});
}