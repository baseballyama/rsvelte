import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import CheckmarkIcon from "./CheckmarkIcon.svelte";
import { detailedStepper } from "./theme";
import clsx from "clsx";
import { getTheme } from "$lib/theme/themeUtils";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'steps',
	'contentClass',
	'class',
	'classes',
	'current',
	'clickable',
	'showCheckmarkForCompleted',
	'onStepClick'
]);

var root = $.from_html(`<p> </p>`);
var root_1 = $.from_html(`<button type="button" class="flex w-full cursor-pointer items-center space-x-2.5 text-left transition-opacity hover:opacity-75 rtl:space-x-reverse"><span><!></span> <span><h3 class="leading-tight font-medium"> </h3> <!></span></button>`);
var root_2 = $.from_html(`<div class="flex items-center space-x-2.5 rtl:space-x-reverse"><span><!></span> <span><h3 class="leading-tight font-medium"> </h3> <!></span></div>`);
var root_3 = $.from_html(`<li><!></li>`);
var root_4 = $.from_html(`<ol></ol>`);

export default function DetailedStepper($$anchor, $$props) {
	$.push($$props, true);

	let steps = $.prop($$props, 'steps', 19, () => []),
		current = $.prop($$props, 'current', 15, 0),
		clickable = $.prop($$props, 'clickable', 3, true),
		showCheckmarkForCompleted = $.prop($$props, 'showCheckmarkForCompleted', 3, true),
		restProps = $.rest_props($$props, rest_excludes);

	// Ensure current is within valid bounds
	$.user_effect(() => {
		if (current() < 0) current(0);
		if (current() > steps().length && steps().length > 0) current(steps().length);
	});

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

	const $$d = $.derived(() => $.get(stepperTheme)()),
		base = $.derived(() => $.get($$d).base),
		item = $.derived(() => $.get($$d).item),
		indicator = $.derived(() => $.get($$d).indicator);

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

	var ol = root_4();

	$.attribute_effect(ol, ($0) => ({ class: $0, ...restProps }), [
		() => $.get(base)({ class: clsx($.get(theme)?.base, $$props.class) })
	]);

	$.each(ol, 23, steps, (step) => step.id, ($$anchor, step, index) => {
		const status = $.derived(() => $.get(step).status ?? getStepStatus($.get(index)));
		var li = root_3();
		var node = $.child(li);

		{
			var consequent_3 = ($$anchor) => {
				var button = root_1();
				var span = $.child(button);
				var node_1 = $.child(span);

				{
					var consequent = ($$anchor) => {
						CheckmarkIcon($$anchor, { variant: 'tick' });
					};

					var consequent_1 = ($$anchor) => {
						var fragment_1 = $.comment();
						var node_2 = $.first_child(fragment_1);

						{
							let $0 = $.derived(() => clsx($.get(step).iconClass));

							$.component(node_2, () => $.get(step).icon, ($$anchor, step_icon) => {
								step_icon($$anchor, {
									get class() {
										return $.get($0);
									}
								});
							});
						}

						$.append($$anchor, fragment_1);
					};

					var alternate = ($$anchor) => {
						var text = $.text();

						$.template_effect(() => $.set_text(text, $.get(step).id));
						$.append($$anchor, text);
					};

					$.if(node_1, ($$render) => {
						if ($.get(status) === "completed" && showCheckmarkForCompleted()) $$render(consequent); else if ($.get(step).icon) $$render(consequent_1, 1); else $$render(alternate, -1);
					});
				}

				$.reset(span);

				var span_1 = $.sibling(span, 2);
				var h3 = $.child(span_1);
				var text_1 = $.only_child(h3, true);
				var node_3 = $.sibling(h3, 2);

				{
					var consequent_2 = ($$anchor) => {
						var p = root();
						var text_2 = $.only_child(p, true);

						$.template_effect(
							($0) => {
								$.set_class(p, 1, $0);
								$.set_text(text_2, $.get(step).description);
							},
							[() => $.clsx(clsx("text-sm", $.get(step).descriptionClass))]
						);

						$.append($$anchor, p);
					};

					$.if(node_3, ($$render) => {
						if ($.get(step).description) $$render(consequent_2);
					});
				}

				$.reset(span_1);
				$.reset(button);

				$.template_effect(
					($0, $1) => {
						$.set_attribute(button, 'aria-current', $.get(status) === "current" ? "step" : undefined);
						$.set_class(span, 1, $0);
						$.set_class(span_1, 1, $1);
						$.set_text(text_1, $.get(step).label);
					},
					[
						() => $.clsx($.get(indicator)({
							status: $.get(status),
							class: clsx($.get(theme)?.indicator, $$props.classes?.indicator)
						})),
						() => $.clsx(clsx($$props.contentClass))
					]
				);

				$.delegated('click', button, () => handleStepClick($.get(index)));
				$.append($$anchor, button);
			};

			var alternate_2 = ($$anchor) => {
				var div = root_2();
				var span_2 = $.child(div);
				var node_4 = $.child(span_2);

				{
					var consequent_4 = ($$anchor) => {
						CheckmarkIcon($$anchor, { variant: 'tick' });
					};

					var consequent_5 = ($$anchor) => {
						var fragment_4 = $.comment();
						var node_5 = $.first_child(fragment_4);

						{
							let $0 = $.derived(() => clsx($.get(step).iconClass));

							$.component(node_5, () => $.get(step).icon, ($$anchor, step_icon_1) => {
								step_icon_1($$anchor, {
									get class() {
										return $.get($0);
									}
								});
							});
						}

						$.append($$anchor, fragment_4);
					};

					var alternate_1 = ($$anchor) => {
						var text_3 = $.text();

						$.template_effect(() => $.set_text(text_3, $.get(step).id));
						$.append($$anchor, text_3);
					};

					$.if(node_4, ($$render) => {
						if ($.get(status) === "completed" && showCheckmarkForCompleted()) $$render(consequent_4); else if ($.get(step).icon) $$render(consequent_5, 1); else $$render(alternate_1, -1);
					});
				}

				$.reset(span_2);

				var span_3 = $.sibling(span_2, 2);
				var h3_1 = $.child(span_3);
				var text_4 = $.only_child(h3_1, true);
				var node_6 = $.sibling(h3_1, 2);

				{
					var consequent_6 = ($$anchor) => {
						var p_1 = root();
						var text_5 = $.only_child(p_1, true);

						$.template_effect(
							($0) => {
								$.set_class(p_1, 1, $0);
								$.set_text(text_5, $.get(step).description);
							},
							[() => $.clsx(clsx("text-sm", $.get(step).descriptionClass))]
						);

						$.append($$anchor, p_1);
					};

					$.if(node_6, ($$render) => {
						if ($.get(step).description) $$render(consequent_6);
					});
				}

				$.reset(span_3);
				$.reset(div);

				$.template_effect(
					($0, $1) => {
						$.set_attribute(div, 'aria-current', $.get(status) === "current" ? "step" : undefined);
						$.set_class(span_2, 1, $0);
						$.set_class(span_3, 1, $1);
						$.set_text(text_4, $.get(step).label);
					},
					[
						() => $.clsx($.get(indicator)({
							status: $.get(status),
							class: clsx($.get(theme)?.indicator, $$props.classes?.indicator)
						})),
						() => $.clsx(clsx($$props.contentClass))
					]
				);

				$.append($$anchor, div);
			};

			$.if(node, ($$render) => {
				if (clickable()) $$render(consequent_3); else $$render(alternate_2, -1);
			});
		}

		$.reset(li);

		$.template_effect(($0) => $.set_class(li, 1, $0), [
			() => $.clsx($.get(item)({
				status: $.get(status),
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