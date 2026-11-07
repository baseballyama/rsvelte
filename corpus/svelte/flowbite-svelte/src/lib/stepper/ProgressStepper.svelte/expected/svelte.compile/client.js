import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import CheckmarkIcon from "./CheckmarkIcon.svelte";
import { progressStepper } from "./theme";
import clsx from "clsx";
import { getTheme } from "$lib/theme/themeUtils";
import { Tween } from "svelte/motion";
import { cubicOut } from "svelte/easing";

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

var root = $.from_html(`<span class="text-sm font-semibold"> </span>`);
var root_1 = $.from_html(`<button type="button"><!></button>`);
var root_2 = $.from_html(`<span><!></span>`);
var root_3 = $.from_html(`<li><!></li>`);
var root_4 = $.from_html(`<ol><div aria-hidden="true"></div> <div aria-hidden="true"></div> <!></ol>`);

export default function ProgressStepper($$anchor, $$props) {
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

	// Animated progress with Tween
	const animatedProgress = new Tween(0, { duration: 100, easing: cubicOut });

	// Update animated progress when current changes
	$.user_effect(() => {
		if (steps().length <= 1 || current() === 0) {
			animatedProgress.target = 0;
		} else {
			const progressPercent = (current() - 1) / (steps().length - 1) * 100;

			animatedProgress.target = progressPercent;
		}
	});

	const theme = $.derived(() => getTheme("progressStepper"));

	const $$d = $.derived(progressStepper),
		base = $.derived(() => $.get($$d).base),
		item = $.derived(() => $.get($$d).item),
		circle = $.derived(() => $.get($$d).circle),
		line = $.derived(() => $.get($$d).line),
		progressLine = $.derived(() => $.get($$d).progressLine);

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

	// Calculate line positions and progress
	// Lines should start from center of first circle and end at center of last circle
	const lineStart = $.derived(() => steps().length <= 1 ? "0" : `${1 / steps().length * 50}%`);

	const lineWidth = $.derived(() => steps().length <= 1 ? "0" : `${100 - 1 / steps().length * 100}%`);

	// Calculate progress width using animated value
	const progressWidth = $.derived(() => steps().length <= 1 || $.get(lineWidth) === "0"
		? "0"
		: `${animatedProgress.current / 100 * parseFloat($.get(lineWidth))}%`);

	var ol = root_4();

	$.attribute_effect(ol, ($0) => ({ class: $0, ...restProps }), [
		() => $.get(base)({ class: clsx($.get(theme)?.base, $$props.class) })
	]);

	var div = $.child(ol);
	var div_1 = $.sibling(div, 2);
	var node = $.sibling(div_1, 2);

	$.each(node, 19, steps, (step) => step.id, ($$anchor, step, index) => {
		const status = $.derived(() => $.get(step).status ?? getStepStatus($.get(index)));
		var li = root_3();
		var node_1 = $.child(li);

		{
			var consequent_2 = ($$anchor) => {
				var button = root_1();
				var node_2 = $.child(button);

				{
					var consequent = ($$anchor) => {
						CheckmarkIcon($$anchor, { variant: 'tick' });
					};

					var consequent_1 = ($$anchor) => {
						var fragment_1 = $.comment();
						var node_3 = $.first_child(fragment_1);

						{
							let $0 = $.derived(() => clsx($.get(step).iconClass) || "h-5 w-5 lg:h-6 lg:w-6");

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
						var span = root();
						var text = $.only_child(span, true);

						$.template_effect(() => $.set_text(text, $.get(step).id));
						$.append($$anchor, span);
					};

					$.if(node_2, ($$render) => {
						if ($.get(status) === "completed" && showCheckmarkForCompleted()) $$render(consequent); else if ($.get(step).icon) $$render(consequent_1, 1); else $$render(alternate, -1);
					});
				}

				$.reset(button);

				$.template_effect(
					($0) => {
						$.set_class(button, 1, $0);
						$.set_attribute(button, 'aria-current', $.get(status) === "current" ? "step" : undefined);
					},
					[
						() => $.clsx($.get(circle)({
							status: $.get(status),
							class: clsx($.get(theme)?.circle, $$props.classes?.circle, "cursor-pointer transition-all hover:brightness-110")
						}))
					]
				);

				$.delegated('click', button, () => handleStepClick($.get(index)));
				$.append($$anchor, button);
			};

			var alternate_2 = ($$anchor) => {
				var span_1 = root_2();
				var node_4 = $.child(span_1);

				{
					var consequent_3 = ($$anchor) => {
						CheckmarkIcon($$anchor, { variant: 'tick' });
					};

					var consequent_4 = ($$anchor) => {
						var fragment_3 = $.comment();
						var node_5 = $.first_child(fragment_3);

						{
							let $0 = $.derived(() => clsx($.get(step).iconClass) || "h-5 w-5 lg:h-6 lg:w-6");

							$.component(node_5, () => $.get(step).icon, ($$anchor, step_icon_1) => {
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
						var span_2 = root();
						var text_1 = $.only_child(span_2, true);

						$.template_effect(() => $.set_text(text_1, $.get(step).id));
						$.append($$anchor, span_2);
					};

					$.if(node_4, ($$render) => {
						if ($.get(status) === "completed" && showCheckmarkForCompleted()) $$render(consequent_3); else if ($.get(step).icon) $$render(consequent_4, 1); else $$render(alternate_1, -1);
					});
				}

				$.reset(span_1);

				$.template_effect(
					($0) => {
						$.set_class(span_1, 1, $0);
						$.set_attribute(span_1, 'aria-current', $.get(status) === "current" ? "step" : undefined);
					},
					[
						() => $.clsx($.get(circle)({
							status: $.get(status),
							class: clsx($.get(theme)?.circle, $$props.classes?.circle)
						}))
					]
				);

				$.append($$anchor, span_1);
			};

			$.if(node_1, ($$render) => {
				if (clickable()) $$render(consequent_2); else $$render(alternate_2, -1);
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

	$.template_effect(
		($0, $1) => {
			$.set_class(div, 1, $0);
			$.set_style(div, `left: ${$.get(lineStart) ?? ''}; width: ${$.get(lineWidth) ?? ''}`);
			$.set_class(div_1, 1, $1);
			$.set_style(div_1, `left: ${$.get(lineStart) ?? ''}; width: ${$.get(progressWidth) ?? ''}`);
		},
		[
			() => $.clsx($.get(line)({ class: clsx($.get(theme)?.line, $$props.classes?.line) })),
			() => $.clsx($.get(progressLine)({
				class: clsx($.get(theme)?.progressLine, $$props.classes?.progressLine)
			}))
		]
	);

	$.append($$anchor, ol);
	$.pop();
}

$.delegate(['click']);