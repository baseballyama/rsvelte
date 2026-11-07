import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ArrowLeftIcon from '@lucide/svelte/icons/arrow-left';
import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';

var root = $.from_html(`<button><span class="font-bold"> </span></button>`);
var root_1 = $.from_html(`<div class="card bg-surface-100-900 p-10 space-y-2 text-center"><h2 class="h3"> </h2> <p> </p></div>`);
var root_2 = $.from_html(`<div class="w-full"><div class="space-y-8"><div class="relative"><div class="flex justify-between items-center gap-4"></div> <hr class="hr !border-surface-200-800 absolute top-[50%] left-0 right-0 z-[-1]"/></div> <!> <nav class="flex justify-between items-center gap-4"><button type="button" class="btn preset-tonal hover:preset-filled"><!> <span>Previous</span></button> <button type="button" class="btn preset-tonal hover:preset-filled"><span>Next</span> <!></button></nav></div></div>`);

export default function Default($$anchor) {
	// Source Data
	const steps = [
		{ label: 'Step 1', description: 'The description of step 1.' },
		{ label: 'Step 2', description: 'The description of step 2.' },
		{ label: 'Step 3', description: 'The description of step 3.' },
		{ label: 'Step 4', description: 'The description of step 4.' },
		{ label: 'Step 5', description: 'The description of step 5.' }
	];

	// Reactive
	let currentStep = $.state(0);

	const isFirstStep = $.derived(() => $.get(currentStep) === 0);
	const isLastStep = $.derived(() => $.get(currentStep) === steps.length - 1);

	/** Determine if on the current step. */
	function isCurrentStep(index) {
		return $.get(currentStep) === index;
	}

	/** Jump to a particular step. */
	function setStep(index) {
		$.set(currentStep, index, true);
	}

	/** Progress to the previous step. */
	function prevStep() {
		$.update(currentStep, -1);
	}

	/** Progress to the next step. */
	function nextStep() {
		$.update(currentStep);
	}

	var div = root_2();
	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var div_3 = $.child(div_2);

	$.each(div_3, 22, () => steps, (step) => step, ($$anchor, step, i) => {
		var button = root();
		var span = $.child(button);
		var text = $.only_child(span, true);

		$.reset(button);

		$.template_effect(
			($0) => {
				$.set_class(button, 1, `btn-icon btn-icon-sm rounded-full ${$0 ?? ''}`);
				$.set_attribute(button, 'title', `Go to ${step.label ?? ''}`);
				$.set_attribute(button, 'aria-label', `Go to ${step.label ?? ''}`);
				$.set_text(text, $.get(i) + 1);
			},
			[
				() => isCurrentStep($.get(i))
					? 'preset-filled-primary-500'
					: 'preset-filled-surface-200-800'
			]
		);

		$.delegated('click', button, () => setStep($.get(i)));
		$.append($$anchor, button);
	});

	$.reset(div_3);
	$.next(2);
	$.reset(div_2);

	var node = $.sibling(div_2, 2);

	$.each(node, 18, () => steps, (step) => step, ($$anchor, step, i) => {
		var fragment = $.comment();
		var node_1 = $.first_child(fragment);

		{
			var consequent = ($$anchor) => {
				var div_4 = root_1();
				var h2 = $.child(div_4);
				var text_1 = $.only_child(h2, true);
				var p = $.sibling(h2, 2);
				var text_2 = $.only_child(p, true);

				$.reset(div_4);

				$.template_effect(() => {
					$.set_text(text_1, step.label);
					$.set_text(text_2, step.description);
				});

				$.append($$anchor, div_4);
			};

			var d = $.derived(() => isCurrentStep($.get(i)));

			$.if(node_1, ($$render) => {
				if ($.get(d)) $$render(consequent);
			});
		}

		$.append($$anchor, fragment);
	});

	var nav = $.sibling(node, 2);
	var button_1 = $.child(nav);
	var node_2 = $.child(button_1);

	ArrowLeftIcon(node_2, { size: 18 });
	$.next(2);
	$.reset(button_1);

	var button_2 = $.sibling(button_1, 2);
	var node_3 = $.sibling($.child(button_2), 2);

	ArrowRightIcon(node_3, { size: 18 });
	$.reset(button_2);
	$.reset(nav);
	$.reset(div_1);
	$.reset(div);

	$.template_effect(() => {
		button_1.disabled = $.get(isFirstStep);
		button_2.disabled = $.get(isLastStep);
	});

	$.delegated('click', button_1, prevStep);
	$.delegated('click', button_2, nextStep);
	$.append($$anchor, div);
}

$.delegate(['click']);