import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { StepIndicator } from "flowbite-svelte";

var root = $.from_html(`<div class="space-y-4"><!> <p class="text-sm text-gray-500 dark:text-gray-400">Step indicators are non-clickable when <code class="text-xs"></code> is set.</p></div>`);

export default function NonClickable($$anchor) {
	let currentStep = $.state(3);
	const steps = ["Step 1", "Step 2", "Step 3", "Step 4", "Step 5"];
	var div = root();
	var node = $.child(div);

	StepIndicator(node, {
		get steps() {
			return steps;
		},
		clickable: false,
		get currentStep() {
			return $.get(currentStep);
		},

		set currentStep($$value) {
			$.set(currentStep, $$value, true);
		}
	});

	var p = $.sibling(node, 2);
	var code = $.sibling($.child(p));

	code.textContent = 'clickable={false}';
	$.next();
	$.reset(p);
	$.reset(div);
	$.append($$anchor, div);
}