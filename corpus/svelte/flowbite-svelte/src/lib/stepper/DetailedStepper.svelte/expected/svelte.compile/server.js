import * as $ from 'svelte/internal/server';
import CheckmarkIcon from "./CheckmarkIcon.svelte";
import { detailedStepper } from "./theme";
import clsx from "clsx";
import { getTheme } from "$lib/theme/themeUtils";

export default function DetailedStepper($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			steps = [],
			contentClass,
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
		const theme = $.derived(() => getTheme("detailedStepper"));

		// Override the theme to make current step also highlighted
		const stepperTheme = $.derived(() => () => {
			const baseTheme = detailedStepper();

			return {
				base: baseTheme.base,
				item: (props) => {
					// Make current status use the same styling as completed
					const status = props.status === "current" ? "completed" : props.status;

					return baseTheme.item({ ...props, status });
				},

				indicator: (props) => {
					// Make current status use the same styling as completed
					const status = props.status === "current" ? "completed" : props.status;

					return baseTheme.indicator({ ...props, status });
				}
			};
		});

		const $$d = $.derived(() => stepperTheme()()),
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

		$$renderer.push(`<ol${$.attributes({
			class: $.clsx(base()({ class: clsx(theme()?.base, className) })),
			...restProps
		})}><!--[-->`);

		const each_array = $.ensure_array_like(steps);

		for (let index = 0, $$length = each_array.length; index < $$length; index++) {
			let step = each_array[index];
			const status = step.status ?? getStepStatus(index);

			$$renderer.push(`<li${$.attr_class($.clsx(item()({ status, class: clsx(theme()?.item, classes?.item) })))}>`);

			if (clickable) {
				$$renderer.push(`<!--[0--><button type="button" class="flex w-full cursor-pointer items-center space-x-2.5 text-left transition-opacity hover:opacity-75 rtl:space-x-reverse"${$.attr('aria-current', status === "current" ? "step" : undefined)}><span${$.attr_class($.clsx(indicator()({ status, class: clsx(theme()?.indicator, classes?.indicator) })))}>`);

				if (status === "completed" && showCheckmarkForCompleted) {
					$$renderer.push('<!--[0-->');
					CheckmarkIcon($$renderer, { variant: 'tick' });
				} else if (step.icon) {
					$$renderer.push('<!--[1-->');

					if (step.icon) {
						$$renderer.push('<!--[-->');
						step.icon($$renderer, { class: clsx(step.iconClass) });
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
				} else {
					$$renderer.push(`<!--[-1-->${$.escape(step.id)}`);
				}

				$$renderer.push(`<!--]--></span> <span${$.attr_class($.clsx(clsx(contentClass)))}><h3 class="leading-tight font-medium">${$.escape(step.label)}</h3> `);

				if (step.description) {
					$$renderer.push(`<!--[0--><p${$.attr_class($.clsx(clsx("text-sm", step.descriptionClass)))}>${$.escape(step.description)}</p>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></span></button>`);
			} else {
				$$renderer.push(`<!--[-1--><div class="flex items-center space-x-2.5 rtl:space-x-reverse"${$.attr('aria-current', status === "current" ? "step" : undefined)}><span${$.attr_class($.clsx(indicator()({ status, class: clsx(theme()?.indicator, classes?.indicator) })))}>`);

				if (status === "completed" && showCheckmarkForCompleted) {
					$$renderer.push('<!--[0-->');
					CheckmarkIcon($$renderer, { variant: 'tick' });
				} else if (step.icon) {
					$$renderer.push('<!--[1-->');

					if (step.icon) {
						$$renderer.push('<!--[-->');
						step.icon($$renderer, { class: clsx(step.iconClass) });
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
				} else {
					$$renderer.push(`<!--[-1-->${$.escape(step.id)}`);
				}

				$$renderer.push(`<!--]--></span> <span${$.attr_class($.clsx(clsx(contentClass)))}><h3 class="leading-tight font-medium">${$.escape(step.label)}</h3> `);

				if (step.description) {
					$$renderer.push(`<!--[0--><p${$.attr_class($.clsx(clsx("text-sm", step.descriptionClass)))}>${$.escape(step.description)}</p>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></span></div>`);
			}

			$$renderer.push(`<!--]--></li>`);
		}

		$$renderer.push(`<!--]--></ol>`);
		$.bind_props($$props, { current });
	});
}