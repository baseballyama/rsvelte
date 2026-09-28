import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { StepIndicator, Button } from "flowbite-svelte";

var root = $.from_html(`<div class="space-y-6"><!> <div class="flex gap-2"><!> <!> <!></div> <p class="text-sm text-gray-500 dark:text-gray-400">Click on any step indicator to navigate directly to that step.</p></div>`);

export default function Clickable($$anchor) {
	let currentStep = $.state(1);
	const steps = ["Step 1", "Step 2", "Step 3", "Step 4", "Step 5"];

	function handleStepClick({ current, last }) {
		console.log(`Navigated from step ${last} to step ${current}`);
	}

	function next() {
		if ($.get(currentStep) < steps.length) {
			$.update(currentStep);
		}
	}

	function prev() {
		if ($.get(currentStep) > 1) {
			$.update(currentStep, -1);
		}
	}

	function reset() {
		$.set(currentStep, 1);
	}

	var div = root();
	var node = $.child(div);

	StepIndicator(node, {
		get steps() {
			return steps;
		},
		onStepClick: handleStepClick,
		get currentStep() {
			return $.get(currentStep);
		},

		set currentStep($$value) {
			$.set(currentStep, $$value, true);
		}
	});

	var div_1 = $.sibling(node, 2);
	var node_1 = $.child(div_1);

	{
		let $0 = $.derived(() => $.get(currentStep) === 1);

		Button(node_1, {
			onclick: prev,
			get disabled() {
				return $.get($0);
			},

			children: ($$anchor, $$slotProps) => {
				$.next();

				var text = $.text('Previous');

				$.append($$anchor, text);
			},
			$$slots: { default: true }
		});
	}

	var node_2 = $.sibling(node_1, 2);

	{
		let $0 = $.derived(() => $.get(currentStep) === steps.length);

		Button(node_2, {
			onclick: next,
			get disabled() {
				return $.get($0);
			},

			children: ($$anchor, $$slotProps) => {
				$.next();

				var text_1 = $.text('Next');

				$.append($$anchor, text_1);
			},
			$$slots: { default: true }
		});
	}

	var node_3 = $.sibling(node_2, 2);

	Button(node_3, {
		onclick: reset,
		color: 'alternative',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('Reset');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	$.reset(div_1);
	$.next(2);
	$.reset(div);
	$.append($$anchor, div);
}