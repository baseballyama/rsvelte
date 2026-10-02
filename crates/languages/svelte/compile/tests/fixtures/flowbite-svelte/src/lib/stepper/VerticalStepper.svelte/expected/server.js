import * as $ from 'svelte/internal/server';
import CheckmarkIcon from "./CheckmarkIcon.svelte";
import { verticalStepper } from "./theme";
import clsx from "clsx";
import { getTheme } from "$lib/theme/themeUtils";

export default function VerticalStepper($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			steps = [],
			liClass,
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
		const theme = $.derived(() => getTheme("verticalStepper"));

		const $$d = $.derived(verticalStepper),
			base = $.derived(() => $$d().base),
			card = $.derived(() => $$d().card),
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
				CheckmarkIcon($$renderer, { variant: 'simple' });
			} else if (status === "current") {
				$$renderer.push('<!--[1-->');

				if (step.icon) {
					$$renderer.push('<!--[0-->');

					if (step.icon) {
						$$renderer.push('<!--[-->');
						step.icon($$renderer, { class: step.iconClass || "h-4 w-4" });
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
				} else {
					$$renderer.push('<!--[-1-->');
					CheckmarkIcon($$renderer, { variant: 'simple' });
				}

				$$renderer.push(`<!--]-->`);
			} else {
				$$renderer.push('<!--[-1-->');
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

			$$renderer.push(`<li${$.attr_class($.clsx(clsx(liClass)))}>`);

			if (clickable) {
				$$renderer.push(`<!--[0--><button type="button"${$.attr_class(`w-full cursor-pointer text-left transition-opacity hover:opacity-75 ${$.stringify(card()({ status, class: clsx(theme()?.card, classes?.card) }))}`)}${$.attr('aria-current', status === "current" ? "step" : undefined)}><div${$.attr_class($.clsx(content()({ class: clsx(theme()?.content, classes?.content) })))}><span class="sr-only">${$.escape(step.label)}</span> <h3 class="font-medium">${$.escape(step.id)}. ${$.escape(step.label)}</h3> `);
				stepIcon($$renderer, status, step);
				$$renderer.push(`<!----></div></button>`);
			} else {
				$$renderer.push(`<!--[-1--><div${$.attr_class($.clsx(card()({ status, class: clsx(theme()?.card, classes?.card) })))}${$.attr('aria-current', status === "current" ? "step" : undefined)}><div${$.attr_class($.clsx(content()({ class: clsx(theme()?.content, classes?.content) })))}><span class="sr-only">${$.escape(step.label)}</span> <h3 class="font-medium">${$.escape(step.id)}. ${$.escape(step.label)}</h3> `);
				stepIcon($$renderer, status, step);
				$$renderer.push(`<!----></div></div>`);
			}

			$$renderer.push(`<!--]--></li>`);
		}

		$$renderer.push(`<!--]--></ol>`);
		$.bind_props($$props, { current });
	});
}