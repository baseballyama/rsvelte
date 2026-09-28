import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import CheckmarkIcon from "./CheckmarkIcon.svelte";
import ProfileCardIcon from "./ProfileCardIcon.svelte";
import { timelineStepper } from "./theme";
import clsx from "clsx";
import { getTheme } from "$lib/theme/themeUtils";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'steps',
	'class',
	'classes',
	'contentClass',
	'current',
	'clickable',
	'showCheckmarkForCompleted',
	'onStepClick'
]);

var root = $.from_html(`<button type="button"><!></button>`);
var root_1 = $.from_html(`<span><!></span>`);
var root_2 = $.from_html(`<p class="text-sm"> </p>`);
var root_3 = $.from_html(`<li><!> <div><h3 class="leading-tight font-medium"> </h3> <!></div></li>`);
var root_4 = $.from_html(`<ol></ol>`);

export default function TimelineStepper($$anchor, $$props) {
	$.push($$props, true);

	const // Ensure current is within valid bounds
	// Handle step click
	// Convert 0-based array index to 1-based current value
	// Call custom onStepClick if provided
	// Determine step status - reactive to current changes
	stepIcon = ($$anchor, status = $.noop, step = $.noop) => {
		var fragment = $.comment();
		var node = $.first_child(fragment);

		{
			var consequent = ($$anchor) => {
				CheckmarkIcon($$anchor, { class: 'h-3.5 w-3.5 text-green-500 dark:text-green-400' });
			};

			var consequent_1 = ($$anchor) => {
				var fragment_2 = $.comment();
				var node_1 = $.first_child(fragment_2);

				{
					let $0 = $.derived(() => clsx(step().iconClass) || "h-3.5 w-3.5");

					$.component(node_1, () => step().icon, ($$anchor, step_icon) => {
						step_icon($$anchor, {
							get class() {
								return $.get($0);
							}
						});
					});
				}

				$.append($$anchor, fragment_2);
			};

			var alternate = ($$anchor) => {
				ProfileCardIcon($$anchor, {});
			};

			$.if(node, ($$render) => {
				if (status() === "completed" && showCheckmarkForCompleted()) $$render(consequent); else if (step().icon) $$render(consequent_1, 1); else $$render(alternate, -1);
			});
		}

		$.append($$anchor, fragment);
	};

	let steps = $.prop($$props, 'steps', 19, () => []),
		current = $.prop($$props, 'current', 15, 1),
		clickable = $.prop($$props, 'clickable', 3, true),
		showCheckmarkForCompleted = $.prop($$props, 'showCheckmarkForCompleted', 3, true),
		restProps = $.rest_props($$props, rest_excludes);

	$.user_effect(() => {
		if (current() < 0) current(0);
		if (current() > steps().length && steps().length > 0) current(steps().length);
	});

	const theme = $.derived(() => getTheme("timelineStepper"));

	const $$d = $.derived(timelineStepper),
		base = $.derived(() => $.get($$d).base),
		item = $.derived(() => $.get($$d).item),
		circle = $.derived(() => $.get($$d).circle);

	// Handle step click
	function handleStepClick(stepIndex) {
		if (clickable() && stepIndex < steps().length) {
			const last = current();

			// Convert 0-based array index to 1-based current value
			current(stepIndex + 1);

			// Call custom onStepClick if provided
			if ($$props.onStepClick) {
				$$props.onStepClick({ current: current(), last });
			}
		}
	}

	// Determine step status - reactive to current changes
	function getStepStatus(stepIndex) {
		if (current() === 0) {
			return "pending";
		}

		if (stepIndex < current() - 1) {
			return "completed";
		} else if (stepIndex === current() - 1) {
			return "current";
		} else {
			return "pending";
		}
	}

	var ol = root_4();

	$.attribute_effect(ol, ($0) => ({ class: $0, ...restProps }), [
		() => $.get(base)({ class: clsx($.get(theme)?.base, $$props.class) })
	]);

	$.each(ol, 23, steps, (step) => step.id, ($$anchor, step, index) => {
		const status = $.derived(() => $.get(step).status ?? getStepStatus($.get(index)));
		var li = root_3();
		var node_2 = $.child(li);

		{
			var consequent_2 = ($$anchor) => {
				var button = root();
				var node_3 = $.child(button);

				stepIcon(node_3, () => $.get(status), () => $.get(step));
				$.reset(button);

				$.template_effect(
					($0) => {
						$.set_class(button, 1, `absolute -start-4 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full ring-4 ring-white transition-opacity hover:opacity-75 dark:ring-gray-900 ${$0 ?? ''}`);
						$.set_attribute(button, 'aria-current', $.get(status) === "current" ? "step" : undefined);
					},
					[
						() => $.get(circle)({
							status: $.get(status),
							class: clsx($.get(theme)?.circle, $$props.classes?.circle)
						})
					]
				);

				$.delegated('click', button, () => handleStepClick($.get(index)));
				$.append($$anchor, button);
			};

			var alternate_1 = ($$anchor) => {
				var span = root_1();
				var node_4 = $.child(span);

				stepIcon(node_4, () => $.get(status), () => $.get(step));
				$.reset(span);

				$.template_effect(
					($0) => {
						$.set_class(span, 1, $0);
						$.set_attribute(span, 'aria-current', $.get(status) === "current" ? "step" : undefined);
					},
					[
						() => $.clsx($.get(circle)({
							status: $.get(status),
							class: clsx($.get(theme)?.circle, $$props.classes?.circle)
						}))
					]
				);

				$.append($$anchor, span);
			};

			$.if(node_2, ($$render) => {
				if (clickable()) $$render(consequent_2); else $$render(alternate_1, -1);
			});
		}

		var div = $.sibling(node_2, 2);
		var h3 = $.child(div);
		var text = $.only_child(h3, true);
		var node_5 = $.sibling(h3, 2);

		{
			var consequent_3 = ($$anchor) => {
				var p = root_2();
				var text_1 = $.only_child(p, true);

				$.template_effect(() => $.set_text(text_1, $.get(step).description));
				$.append($$anchor, p);
			};

			$.if(node_5, ($$render) => {
				if ($.get(step).description) $$render(consequent_3);
			});
		}

		$.reset(div);
		$.reset(li);

		$.template_effect(
			($0, $1) => {
				$.set_class(li, 1, $0);
				$.set_class(div, 1, $1);
				$.set_text(text, $.get(step).label);
			},
			[
				() => $.clsx($.get(item)({
					isLast: $.get(index) === steps().length - 1,
					class: clsx($.get(theme)?.item, $$props.classes?.item)
				})),
				() => $.clsx(clsx($$props.contentClass))
			]
		);

		$.append($$anchor, li);
	});

	$.reset(ol);
	$.append($$anchor, ol);
	$.pop();
}

$.delegate(['click']);