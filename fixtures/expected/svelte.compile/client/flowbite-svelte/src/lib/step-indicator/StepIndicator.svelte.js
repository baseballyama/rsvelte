import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import clsx from "clsx";
import { stepIndicator, getStepStateClasses } from "./theme";
import { getTheme } from "$lib/theme/themeUtils";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'steps',
	'currentStep',
	'size',
	'color',
	'glow',
	'hideLabel',
	'clickable',
	'completedCustom',
	'currentCustom',
	'onStepClick',
	'class',
	'classes'
]);

var root = $.from_html(`<h3> </h3>`);
var root_1 = $.from_html(`<div></div>`);
var root_2 = $.from_html(`<button type="button" aria-current="step"><div data-state="current"></div> <!></button>`);
var root_3 = $.from_html(`<button type="button" data-state="completed"></button>`);
var root_4 = $.from_html(`<button type="button" data-state="incomplete"></button>`);
var root_5 = $.from_html(`<div><div data-state="current"></div> <!></div>`);
var root_6 = $.from_html(`<div data-state="completed"></div>`);
var root_7 = $.from_html(`<div data-state="incomplete"></div>`);
var root_8 = $.from_html(`<div><!> <div></div></div>`);

export default function StepIndicator($$anchor, $$props) {
	$.push($$props, true);

	let steps = $.prop($$props, 'steps', 19, () => ["Step 1", "Step 2", "Step 3", "Step 4", "Step 5"]),
		currentStep = $.prop($$props, 'currentStep', 15, 1),
		size = $.prop($$props, 'size', 11, "md"),
		color = $.prop($$props, 'color', 11, "primary"),
		glow = $.prop($$props, 'glow', 3, false),
		hideLabel = $.prop($$props, 'hideLabel', 3, false),
		clickable = $.prop($$props, 'clickable', 3, true),
		completedCustom = $.prop($$props, 'completedCustom', 3, ""),
		currentCustom = $.prop($$props, 'currentCustom', 3, ""),
		restProps = $.rest_props($$props, rest_excludes);

	const theme = $.derived(() => getTheme("stepIndicator"));

	const $$d = $.derived(() => stepIndicator({
			size: size(),
			color: color(),
			glow: glow(),
			hideLabel: hideLabel()
		})),
		base = $.derived(() => $.get($$d).base),
		label = $.derived(() => $.get($$d).label),
		container = $.derived(() => $.get($$d).container),
		wrapper = $.derived(() => $.get($$d).wrapper),
		stepCls = $.derived(() => $.get($$d).step),
		stepGlow = $.derived(() => $.get($$d).glow),
		incomplete = $.derived(() => $.get($$d).incomplete);

	// Ensure currentStep is within bounds
	let safeCurrentStep = $.derived(() => Math.max(1, Math.min(currentStep(), steps().length)));

	let currentStepLabel = $.derived(() => steps()[$.get(safeCurrentStep) - 1] ?? "Unknown Step");

	// Handle step click
	function handleStepClick(stepIndex) {
		if (!clickable() || stepIndex < 0 || stepIndex >= steps().length) return;

		const next = stepIndex + 1;

		if (next === currentStep()) return;

		const last = currentStep();

		currentStep(next);

		if ($$props.onStepClick) {
			$$props.onStepClick({ current: currentStep(), last });
		}
	}

	// Handle custom colors if provided
	const getCustomStepClass = (stepIndex) => {
		if (color() !== "custom") return "";

		if (stepIndex === currentStep() - 1) {
			return currentCustom();
		} else if (stepIndex < currentStep() - 1) {
			return completedCustom();
		}

		return "";
	};

	var div = root_8();

	$.attribute_effect(div, ($0) => ({ ...restProps, class: $0 }), [
		() => $.get(base)({ class: clsx($.get(theme)?.base, $$props.class) })
	]);

	var node = $.child(div);

	{
		var consequent = ($$anchor) => {
			var h3 = root();
			var text = $.only_child(h3, true);

			$.template_effect(
				($0) => {
					$.set_class(h3, 1, $0);
					$.set_text(text, $.get(currentStepLabel));
				},
				[
					() => $.clsx($.get(label)({ class: clsx($.get(theme)?.label, $$props.classes?.label) }))
				]
			);

			$.append($$anchor, h3);
		};

		$.if(node, ($$render) => {
			if (!hideLabel()) $$render(consequent);
		});
	}

	var div_1 = $.sibling(node, 2);

	$.each(div_1, 21, steps, $.index, ($$anchor, _step, i) => {
		var fragment = $.comment();
		var node_1 = $.first_child(fragment);

		{
			var consequent_4 = ($$anchor) => {
				var fragment_1 = $.comment();
				var node_2 = $.first_child(fragment_1);

				{
					var consequent_2 = ($$anchor) => {
						var button = root_2();
						var div_2 = $.child(button);
						var node_3 = $.sibling(div_2, 2);

						{
							var consequent_1 = ($$anchor) => {
								var div_3 = root_1();

								$.template_effect(($0) => $.set_class(div_3, 1, $0), [
									() => $.clsx($.get(stepGlow)({
										class: clsx(getCustomStepClass(i), $.get(theme)?.glow, $$props.classes?.glow)
									}))
								]);

								$.append($$anchor, div_3);
							};

							$.if(node_3, ($$render) => {
								if (glow()) $$render(consequent_1);
							});
						}

						$.reset(button);

						$.template_effect(
							($0, $1) => {
								$.set_class(button, 1, $0);
								$.set_attribute(button, 'aria-label', `Current step: ${steps()[i]}`);
								$.set_class(div_2, 1, $1);
							},
							[
								() => $.clsx($.get(wrapper)({
									class: clsx($.get(theme)?.wrapper, $$props.classes?.wrapper, "cursor-pointer transition-opacity hover:opacity-75")
								})),

								() => $.clsx($.get(stepCls)({
									class: clsx(getStepStateClasses(i, currentStep()), getCustomStepClass(i), $.get(theme)?.step, $$props.classes?.step)
								}))
							]
						);

						$.delegated('click', button, () => handleStepClick(i));
						$.append($$anchor, button);
					};

					var consequent_3 = ($$anchor) => {
						var button_1 = root_3();

						$.template_effect(
							($0) => {
								$.set_attribute(button_1, 'aria-label', `Go to ${steps()[i]} (completed)`);
								$.set_class(button_1, 1, $0);
							},
							[
								() => $.clsx($.get(stepCls)({
									class: clsx(getStepStateClasses(i, currentStep()), getCustomStepClass(i), $.get(theme)?.step, $$props.classes?.step, "cursor-pointer transition-opacity hover:opacity-75")
								}))
							]
						);

						$.delegated('click', button_1, () => handleStepClick(i));
						$.append($$anchor, button_1);
					};

					var alternate = ($$anchor) => {
						var button_2 = root_4();

						$.template_effect(
							($0) => {
								$.set_attribute(button_2, 'aria-label', `Go to ${steps()[i]}`);
								$.set_class(button_2, 1, $0);
							},
							[
								() => $.clsx($.get(incomplete)({
									class: clsx($.get(theme)?.incomplete, $$props.classes?.incomplete, "cursor-pointer transition-opacity hover:opacity-75")
								}))
							]
						);

						$.delegated('click', button_2, () => handleStepClick(i));
						$.append($$anchor, button_2);
					};

					$.if(node_2, ($$render) => {
						if (i === currentStep() - 1) $$render(consequent_2); else if (i < currentStep() - 1) $$render(consequent_3, 1); else $$render(alternate, -1);
					});
				}

				$.append($$anchor, fragment_1);
			};

			var consequent_6 = ($$anchor) => {
				var div_4 = root_5();
				var div_5 = $.child(div_4);
				var node_4 = $.sibling(div_5, 2);

				{
					var consequent_5 = ($$anchor) => {
						var div_6 = root_1();

						$.template_effect(($0) => $.set_class(div_6, 1, $0), [
							() => $.clsx($.get(stepGlow)({
								class: clsx(getCustomStepClass(i), $.get(theme)?.glow, $$props.classes?.glow)
							}))
						]);

						$.append($$anchor, div_6);
					};

					$.if(node_4, ($$render) => {
						if (glow()) $$render(consequent_5);
					});
				}

				$.reset(div_4);

				$.template_effect(
					($0, $1) => {
						$.set_class(div_4, 1, $0);
						$.set_class(div_5, 1, $1);
					},
					[
						() => $.clsx($.get(wrapper)({ class: clsx($.get(theme)?.wrapper, $$props.classes?.wrapper) })),
						() => $.clsx($.get(stepCls)({
							class: clsx(getStepStateClasses(i, currentStep()), getCustomStepClass(i), $.get(theme)?.step, $$props.classes?.step)
						}))
					]
				);

				$.append($$anchor, div_4);
			};

			var consequent_7 = ($$anchor) => {
				var div_7 = root_6();

				$.template_effect(($0) => $.set_class(div_7, 1, $0), [
					() => $.clsx($.get(stepCls)({
						class: clsx(getStepStateClasses(i, currentStep()), getCustomStepClass(i), $.get(theme)?.step, $$props.classes?.step)
					}))
				]);

				$.append($$anchor, div_7);
			};

			var alternate_1 = ($$anchor) => {
				var div_8 = root_7();

				$.template_effect(($0) => $.set_class(div_8, 1, $0), [
					() => $.clsx($.get(incomplete)({
						class: clsx($.get(theme)?.incomplete, $$props.classes?.incomplete)
					}))
				]);

				$.append($$anchor, div_8);
			};

			$.if(node_1, ($$render) => {
				if (clickable()) $$render(consequent_4); else if (i === currentStep() - 1) $$render(consequent_6, 1); else if (i < currentStep() - 1) $$render(consequent_7, 2); else $$render(alternate_1, -1);
			});
		}

		$.append($$anchor, fragment);
	});

	$.reset(div_1);
	$.reset(div);

	$.template_effect(($0) => $.set_class(div_1, 1, $0), [
		() => $.clsx($.get(container)({
			class: clsx($.get(theme)?.container, $$props.classes?.container)
		}))
	]);

	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);