import * as $ from 'svelte/internal/server';
import CheckmarkIcon from "./CheckmarkIcon.svelte";
import DoubleArrowIcon from "./DoubleArrowIcon.svelte";
import { breadcrumbStepper } from "./theme";
import clsx from "clsx";
import { getTheme } from "$lib/theme/themeUtils";

export default function BreadcrumbStepper($$renderer, $$props) {
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
		const theme = $.derived(() => getTheme("breadcrumbStepper"));

		const $$d = $.derived(breadcrumbStepper),
			base = $.derived(() => $$d().base),
			item = $.derived(() => $$d().item),
			indicator = $.derived(() => $$d().indicator);

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

		$$renderer.push(`<ol${$.attributes({
			class: $.clsx(base()({ class: clsx(theme()?.base, className) })),
			...restProps
		})}><!--[-->`);

		const each_array = $.ensure_array_like(steps);

		for (let index = 0, $$length = each_array.length; index < $$length; index++) {
			let step = each_array[index];
			const status = step.status ?? getStepStatus(index);

			$$renderer.push(`<li${$.attr_class($.clsx(item()({
				status,
				hasChevron: index < steps.length - 1,
				class: clsx(theme()?.item, classes?.item)
			})))}>`);

			if (clickable) {
				$$renderer.push(`<!--[0--><button type="button" class="flex cursor-pointer items-center transition-opacity hover:opacity-75"${$.attr('aria-current', status === "current" ? "step" : undefined)}><span${$.attr_class($.clsx(indicator()({ status, class: clsx(theme()?.indicator, classes?.indicator) })))}>`);

				if (status === "completed" && showCheckmarkForCompleted) {
					$$renderer.push('<!--[0-->');

					if (step.icon) {
						$$renderer.push('<!--[0-->');

						if (step.icon) {
							$$renderer.push('<!--[-->');
							step.icon($$renderer, { class: step.iconClass || "h-3 w-3" });
							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					} else {
						$$renderer.push('<!--[-1-->');
						CheckmarkIcon($$renderer, { variant: 'simple', class: 'h-3 w-3' });
					}

					$$renderer.push(`<!--]-->`);
				} else if (step.icon) {
					$$renderer.push('<!--[1-->');

					if (step.icon) {
						$$renderer.push('<!--[-->');
						step.icon($$renderer, { class: step.iconClass || "h-3 w-3" });
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
				} else {
					$$renderer.push(`<!--[-1-->${$.escape(step.id)}`);
				}

				$$renderer.push(`<!--]--></span> ${$.escape(step.label)} `);

				if (step.shortLabel) {
					$$renderer.push(`<!--[0--><span class="hidden sm:ms-2 sm:inline-flex">${$.escape(step.shortLabel)}</span>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></button>`);
			} else {
				$$renderer.push(`<!--[-1--><span${$.attr('aria-current', status === "current" ? "step" : undefined)} class="flex items-center"><span${$.attr_class($.clsx(indicator()({ status, class: clsx(theme()?.indicator, classes?.indicator) })))}>`);

				if (status === "completed" && showCheckmarkForCompleted) {
					$$renderer.push('<!--[0-->');

					if (step.icon) {
						$$renderer.push('<!--[0-->');

						if (step.icon) {
							$$renderer.push('<!--[-->');
							step.icon($$renderer, { class: step.iconClass || "h-3 w-3" });
							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					} else {
						$$renderer.push('<!--[-1-->');
						CheckmarkIcon($$renderer, { variant: 'simple', class: 'h-3 w-3' });
					}

					$$renderer.push(`<!--]-->`);
				} else if (step.icon) {
					$$renderer.push('<!--[1-->');

					if (step.icon) {
						$$renderer.push('<!--[-->');
						step.icon($$renderer, { class: step.iconClass || "h-3 w-3" });
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
				} else {
					$$renderer.push(`<!--[-1-->${$.escape(step.id)}`);
				}

				$$renderer.push(`<!--]--></span> ${$.escape(step.label)} `);

				if (step.shortLabel) {
					$$renderer.push(`<!--[0--><span class="hidden sm:ms-2 sm:inline-flex">${$.escape(step.shortLabel)}</span>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></span>`);
			}

			$$renderer.push(`<!--]--> `);

			if (index < steps.length - 1) {
				$$renderer.push('<!--[0-->');
				DoubleArrowIcon($$renderer, {});
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></li>`);
		}

		$$renderer.push(`<!--]--></ol>`);
		$.bind_props($$props, { current });
	});
}