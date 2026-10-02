import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import CheckmarkIcon from "./CheckmarkIcon.svelte";
import { verticalStepper } from "./theme";
import clsx from "clsx";
import { getTheme } from "$lib/theme/themeUtils";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'steps',
	'liClass',
	'class',
	'classes',
	'current',
	'clickable',
	'showCheckmarkForCompleted',
	'onStepClick'
]);

var root = $.from_html(`<button type="button"><div><span class="sr-only"> </span> <h3 class="font-medium"> </h3> <!></div></button>`);
var root_1 = $.from_html(`<div><div><span class="sr-only"> </span> <h3 class="font-medium"> </h3> <!></div></div>`);
var root_2 = $.from_html(`<li><!></li>`);
var root_3 = $.from_html(`<ol></ol>`);

export default function VerticalStepper($$anchor, $$props) {
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
				CheckmarkIcon($$anchor, { variant: 'simple' });
			};

			var consequent_2 = ($$anchor) => {
				var fragment_2 = $.comment();
				var node_1 = $.first_child(fragment_2);

				{
					var consequent_1 = ($$anchor) => {
						var fragment_3 = $.comment();
						var node_2 = $.first_child(fragment_3);

						{
							let $0 = $.derived(() => step().iconClass || "h-4 w-4");

							$.component(node_2, () => step().icon, ($$anchor, step_icon) => {
								step_icon($$anchor, {
									get class() {
										return $.get($0);
									}
								});
							});
						}

						$.append($$anchor, fragment_3);
					};

					var alternate = ($$anchor) => {
						CheckmarkIcon($$anchor, { variant: 'simple' });
					};

					$.if(node_1, ($$render) => {
						if (step().icon) $$render(consequent_1); else $$render(alternate, -1);
					});
				}

				$.append($$anchor, fragment_2);
			};

			$.if(node, ($$render) => {
				if (status() === "completed" && showCheckmarkForCompleted()) $$render(consequent); else if (status() === "current") $$render(consequent_2, 1);
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

	const theme = $.derived(() => getTheme("verticalStepper"));

	const $$d = $.derived(verticalStepper),
		base = $.derived(() => $.get($$d).base),
		card = $.derived(() => $.get($$d).card),
		content = $.derived(() => $.get($$d).content);

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

	var ol = root_3();

	$.attribute_effect(ol, ($0) => ({ class: $0, ...restProps }), [
		() => $.get(base)({ class: clsx($.get(theme)?.base, $$props.class) })
	]);

	$.each(ol, 23, steps, (step) => step.id, ($$anchor, step, index) => {
		const status = $.derived(() => $.get(step).status ?? getStepStatus($.get(index)));
		var li = root_2();
		var node_3 = $.child(li);

		{
			var consequent_3 = ($$anchor) => {
				var button = root();
				var div = $.child(button);
				var span = $.child(div);
				var text = $.only_child(span, true);
				var h3 = $.sibling(span, 2);
				var text_1 = $.only_child(h3);
				var node_4 = $.sibling(h3, 2);

				stepIcon(node_4, () => $.get(status), () => $.get(step));
				$.reset(div);
				$.reset(button);

				$.template_effect(
					($0, $1) => {
						$.set_class(button, 1, `w-full cursor-pointer text-left transition-opacity hover:opacity-75 ${$0 ?? ''}`);
						$.set_attribute(button, 'aria-current', $.get(status) === "current" ? "step" : undefined);
						$.set_class(div, 1, $1);
						$.set_text(text, $.get(step).label);
						$.set_text(text_1, `${$.get(step).id ?? ''}. ${$.get(step).label ?? ''}`);
					},
					[
						() => $.get(card)({
							status: $.get(status),
							class: clsx($.get(theme)?.card, $$props.classes?.card)
						}),
						() => $.clsx($.get(content)({ class: clsx($.get(theme)?.content, $$props.classes?.content) }))
					]
				);

				$.delegated('click', button, () => handleStepClick($.get(index)));
				$.append($$anchor, button);
			};

			var alternate_1 = ($$anchor) => {
				var div_1 = root_1();
				var div_2 = $.child(div_1);
				var span_1 = $.child(div_2);
				var text_2 = $.only_child(span_1, true);
				var h3_1 = $.sibling(span_1, 2);
				var text_3 = $.only_child(h3_1);
				var node_5 = $.sibling(h3_1, 2);

				stepIcon(node_5, () => $.get(status), () => $.get(step));
				$.reset(div_2);
				$.reset(div_1);

				$.template_effect(
					($0, $1) => {
						$.set_class(div_1, 1, $0);
						$.set_attribute(div_1, 'aria-current', $.get(status) === "current" ? "step" : undefined);
						$.set_class(div_2, 1, $1);
						$.set_text(text_2, $.get(step).label);
						$.set_text(text_3, `${$.get(step).id ?? ''}. ${$.get(step).label ?? ''}`);
					},
					[
						() => $.clsx($.get(card)({
							status: $.get(status),
							class: clsx($.get(theme)?.card, $$props.classes?.card)
						})),
						() => $.clsx($.get(content)({ class: clsx($.get(theme)?.content, $$props.classes?.content) }))
					]
				);

				$.append($$anchor, div_1);
			};

			$.if(node_3, ($$render) => {
				if (clickable()) $$render(consequent_3); else $$render(alternate_1, -1);
			});
		}

		$.reset(li);
		$.template_effect(($0) => $.set_class(li, 1, $0), [() => $.clsx(clsx($$props.liClass))]);
		$.append($$anchor, li);
	});

	$.reset(ol);
	$.append($$anchor, ol);
	$.pop();
}

$.delegate(['click']);