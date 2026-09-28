import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import CheckmarkIcon from "./CheckmarkIcon.svelte";
import DoubleArrowIcon from "./DoubleArrowIcon.svelte";
import { breadcrumbStepper } from "./theme";
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

var root = $.from_html(`<span class="hidden sm:ms-2 sm:inline-flex"> </span>`);
var root_1 = $.from_html(`<button type="button" class="flex cursor-pointer items-center transition-opacity hover:opacity-75"><span><!></span> <!></button>`);
var root_2 = $.from_html(`<span class="flex items-center"><span><!></span> <!></span>`);
var root_3 = $.from_html(`<li><!> <!></li>`);
var root_4 = $.from_html(`<ol></ol>`);

export default function BreadcrumbStepper($$anchor, $$props) {
	$.push($$props, true);

	let steps = $.prop($$props, 'steps', 19, () => []),
		current = $.prop($$props, 'current', 15, 1),
		clickable = $.prop($$props, 'clickable', 3, true),
		showCheckmarkForCompleted = $.prop($$props, 'showCheckmarkForCompleted', 3, true),
		restProps = $.rest_props($$props, rest_excludes);

	// Ensure current is within valid bounds
	$.user_effect(() => {
		if (current() < 0) current(0);
		if (current() > steps().length && steps().length > 0) current(steps().length);
	});

	const theme = $.derived(() => getTheme("breadcrumbStepper"));

	const $$d = $.derived(breadcrumbStepper),
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
			var consequent_4 = ($$anchor) => {
				var button = root_1();
				var span = $.child(button);
				var node_1 = $.child(span);

				{
					var consequent_1 = ($$anchor) => {
						var fragment = $.comment();
						var node_2 = $.first_child(fragment);

						{
							var consequent = ($$anchor) => {
								var fragment_1 = $.comment();
								var node_3 = $.first_child(fragment_1);

								{
									let $0 = $.derived(() => $.get(step).iconClass || "h-3 w-3");

									$.component(node_3, () => $.get(step).icon, ($$anchor, step_icon) => {
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
								CheckmarkIcon($$anchor, { variant: 'simple', class: 'h-3 w-3' });
							};

							$.if(node_2, ($$render) => {
								if ($.get(step).icon) $$render(consequent); else $$render(alternate, -1);
							});
						}

						$.append($$anchor, fragment);
					};

					var consequent_2 = ($$anchor) => {
						var fragment_3 = $.comment();
						var node_4 = $.first_child(fragment_3);

						{
							let $0 = $.derived(() => $.get(step).iconClass || "h-3 w-3");

							$.component(node_4, () => $.get(step).icon, ($$anchor, step_icon_1) => {
								step_icon_1($$anchor, {
									get class() {
										return $.get($0);
									}
								});
							});
						}

						$.append($$anchor, fragment_3);
					};

					var alternate_1 = ($$anchor) => {
						var text = $.text();

						$.template_effect(() => $.set_text(text, $.get(step).id));
						$.append($$anchor, text);
					};

					$.if(node_1, ($$render) => {
						if ($.get(status) === "completed" && showCheckmarkForCompleted()) $$render(consequent_1); else if ($.get(step).icon) $$render(consequent_2, 1); else $$render(alternate_1, -1);
					});
				}

				$.reset(span);

				var text_1 = $.sibling(span);
				var node_5 = $.sibling(text_1);

				{
					var consequent_3 = ($$anchor) => {
						var span_1 = root();
						var text_2 = $.only_child(span_1, true);

						$.template_effect(() => $.set_text(text_2, $.get(step).shortLabel));
						$.append($$anchor, span_1);
					};

					$.if(node_5, ($$render) => {
						if ($.get(step).shortLabel) $$render(consequent_3);
					});
				}

				$.reset(button);

				$.template_effect(
					($0) => {
						$.set_attribute(button, 'aria-current', $.get(status) === "current" ? "step" : undefined);
						$.set_class(span, 1, $0);
						$.set_text(text_1, ` ${$.get(step).label ?? ''} `);
					},
					[
						() => $.clsx($.get(indicator)({
							status: $.get(status),
							class: clsx($.get(theme)?.indicator, $$props.classes?.indicator)
						}))
					]
				);

				$.delegated('click', button, () => handleStepClick($.get(index)));
				$.append($$anchor, button);
			};

			var alternate_4 = ($$anchor) => {
				var span_2 = root_2();
				var span_3 = $.child(span_2);
				var node_6 = $.child(span_3);

				{
					var consequent_6 = ($$anchor) => {
						var fragment_5 = $.comment();
						var node_7 = $.first_child(fragment_5);

						{
							var consequent_5 = ($$anchor) => {
								var fragment_6 = $.comment();
								var node_8 = $.first_child(fragment_6);

								{
									let $0 = $.derived(() => $.get(step).iconClass || "h-3 w-3");

									$.component(node_8, () => $.get(step).icon, ($$anchor, step_icon_2) => {
										step_icon_2($$anchor, {
											get class() {
												return $.get($0);
											}
										});
									});
								}

								$.append($$anchor, fragment_6);
							};

							var alternate_2 = ($$anchor) => {
								CheckmarkIcon($$anchor, { variant: 'simple', class: 'h-3 w-3' });
							};

							$.if(node_7, ($$render) => {
								if ($.get(step).icon) $$render(consequent_5); else $$render(alternate_2, -1);
							});
						}

						$.append($$anchor, fragment_5);
					};

					var consequent_7 = ($$anchor) => {
						var fragment_8 = $.comment();
						var node_9 = $.first_child(fragment_8);

						{
							let $0 = $.derived(() => $.get(step).iconClass || "h-3 w-3");

							$.component(node_9, () => $.get(step).icon, ($$anchor, step_icon_3) => {
								step_icon_3($$anchor, {
									get class() {
										return $.get($0);
									}
								});
							});
						}

						$.append($$anchor, fragment_8);
					};

					var alternate_3 = ($$anchor) => {
						var text_3 = $.text();

						$.template_effect(() => $.set_text(text_3, $.get(step).id));
						$.append($$anchor, text_3);
					};

					$.if(node_6, ($$render) => {
						if ($.get(status) === "completed" && showCheckmarkForCompleted()) $$render(consequent_6); else if ($.get(step).icon) $$render(consequent_7, 1); else $$render(alternate_3, -1);
					});
				}

				$.reset(span_3);

				var text_4 = $.sibling(span_3);
				var node_10 = $.sibling(text_4);

				{
					var consequent_8 = ($$anchor) => {
						var span_4 = root();
						var text_5 = $.only_child(span_4, true);

						$.template_effect(() => $.set_text(text_5, $.get(step).shortLabel));
						$.append($$anchor, span_4);
					};

					$.if(node_10, ($$render) => {
						if ($.get(step).shortLabel) $$render(consequent_8);
					});
				}

				$.reset(span_2);

				$.template_effect(
					($0) => {
						$.set_attribute(span_2, 'aria-current', $.get(status) === "current" ? "step" : undefined);
						$.set_class(span_3, 1, $0);
						$.set_text(text_4, ` ${$.get(step).label ?? ''} `);
					},
					[
						() => $.clsx($.get(indicator)({
							status: $.get(status),
							class: clsx($.get(theme)?.indicator, $$props.classes?.indicator)
						}))
					]
				);

				$.append($$anchor, span_2);
			};

			$.if(node, ($$render) => {
				if (clickable()) $$render(consequent_4); else $$render(alternate_4, -1);
			});
		}

		var node_11 = $.sibling(node, 2);

		{
			var consequent_9 = ($$anchor) => {
				DoubleArrowIcon($$anchor, {});
			};

			$.if(node_11, ($$render) => {
				if ($.get(index) < steps().length - 1) $$render(consequent_9);
			});
		}

		$.reset(li);

		$.template_effect(($0) => $.set_class(li, 1, $0), [
			() => $.clsx($.get(item)({
				status: $.get(status),
				hasChevron: $.get(index) < steps().length - 1,
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