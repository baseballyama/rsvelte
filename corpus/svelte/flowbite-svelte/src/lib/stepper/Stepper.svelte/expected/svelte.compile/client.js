import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import CheckmarkIcon from "./CheckmarkIcon.svelte";
import { stepper } from "./theme";
import clsx from "clsx";
import { getTheme } from "$lib/theme/themeUtils";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'steps',
	'class',
	'classes',
	'current',
	'clickable',
	'showCheckmarkForCompleted',
	'onStepClick'
]);

var root = $.from_html(`<span class="me-2"> </span>`);
var root_1 = $.from_html(`<span> </span>`);
var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`<button type="button"><!></button>`);
var root_4 = $.from_html(`<span><!></span>`);
var root_5 = $.from_html(`<li><!></li>`);
var root_6 = $.from_html(`<ol></ol>`);

export default function Stepper($$anchor, $$props) {
	$.push($$props, true);

	const // Ensure current is within valid bounds
	// Handle step click
	// Convert 0-based array index to 1-based current value
	// Call custom onStepClick if provided
	// Determine step status - reactive to current changes
	// current = 0: no items highlighted (all pending)
	// current = 1: first item is current
	// current = 2: first is completed, second is current
	stepContent = ($$anchor, step = $.noop, status = $.noop, index = $.noop) => {
		var fragment = root_2();
		var node = $.first_child(fragment);

		{
			var consequent = ($$anchor) => {
				CheckmarkIcon($$anchor, {});
			};

			var consequent_1 = ($$anchor) => {
				var fragment_2 = $.comment();
				var node_1 = $.first_child(fragment_2);

				{
					let $0 = $.derived(() => clsx(step().iconClass) || "me-2.5 h-3.5 w-3.5 sm:h-4 sm:w-4");

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
				var span = root();
				var text = $.only_child(span, true);

				$.template_effect(() => $.set_text(text, step().id || index() + 1));
				$.append($$anchor, span);
			};

			$.if(node, ($$render) => {
				if (status() === "completed" && showCheckmarkForCompleted()) $$render(consequent); else if (step().icon) $$render(consequent_1, 1); else $$render(alternate, -1);
			});
		}

		var text_1 = $.sibling(node);
		var node_2 = $.sibling(text_1);

		{
			var consequent_2 = ($$anchor) => {
				var span_1 = root_1();
				var text_2 = $.only_child(span_1, true);

				$.template_effect(
					($0) => {
						$.set_class(span_1, 1, $0);
						$.set_text(text_2, step().description);
					},
					[
						() => $.clsx(clsx(step().descriptionClass) || "hidden sm:ms-2 sm:inline-flex")
					]
				);

				$.append($$anchor, span_1);
			};

			$.if(node_2, ($$render) => {
				if (step().description) $$render(consequent_2);
			});
		}

		$.template_effect(() => $.set_text(text_1, ` ${step().label ?? ''} `));
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

	const theme = $.derived(() => getTheme("stepper"));

	const $$d = $.derived(stepper),
		base = $.derived(() => $.get($$d).base),
		item = $.derived(() => $.get($$d).item),
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
	// current = 0: no items highlighted (all pending)
	// current = 1: first item is current
	// current = 2: first is completed, second is current
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

	var ol = root_6();

	$.attribute_effect(ol, ($0) => ({ ...restProps, class: $0 }), [
		() => $.get(base)({ class: clsx($.get(theme)?.base, $$props.class) })
	]);

	$.each(ol, 23, steps, (step, index) => step.id ?? index, ($$anchor, step, index) => {
		const status = $.derived(() => $.get(step).status ?? getStepStatus($.get(index)));
		var li = root_5();
		var node_3 = $.child(li);

		{
			var consequent_3 = ($$anchor) => {
				var button = root_3();
				var node_4 = $.child(button);

				stepContent(node_4, () => $.get(step), () => $.get(status), () => $.get(index));
				$.reset(button);

				$.template_effect(
					($0) => {
						$.set_class(button, 1, $0);
						$.set_attribute(button, 'aria-current', $.get(status) === "current" ? "step" : undefined);
					},
					[
						() => $.clsx($.get(content)({
							status: $.get(status),
							isLast: $.get(index) === steps().length - 1,
							class: clsx($.get(theme)?.content, $$props.classes?.content, "w-full cursor-pointer text-left transition-opacity hover:opacity-75")
						}))
					]
				);

				$.delegated('click', button, () => handleStepClick($.get(index)));
				$.append($$anchor, button);
			};

			var alternate_1 = ($$anchor) => {
				var span_2 = root_4();
				var node_5 = $.child(span_2);

				stepContent(node_5, () => $.get(step), () => $.get(status), () => $.get(index));
				$.reset(span_2);

				$.template_effect(($0) => $.set_class(span_2, 1, $0), [
					() => $.clsx($.get(content)({
						status: $.get(status),
						isLast: $.get(index) === steps().length - 1,
						class: clsx($.get(theme)?.content, $$props.classes?.content)
					}))
				]);

				$.append($$anchor, span_2);
			};

			$.if(node_3, ($$render) => {
				if (clickable()) $$render(consequent_3); else $$render(alternate_1, -1);
			});
		}

		$.reset(li);

		$.template_effect(($0) => $.set_class(li, 1, $0), [
			() => $.clsx($.get(item)({
				status: $.get(status),
				isLast: $.get(index) === steps().length - 1,
				class: clsx($.get(theme)?.item, $$props.classes?.item)
			}))
		]);

		$.append($$anchor, li);
	});

	$.reset(ol);
	$.append($$anchor, ol);
	$.pop();
}

$.delegate(['click']);