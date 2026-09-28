import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ProgressStepper, Button, P, Heading } from "flowbite-svelte";

var root = $.from_html(`<strong>current =</strong> `, 1);
var root_1 = $.from_html(`<strong>Display as:</strong> `, 1);
var root_2 = $.from_html(`<!> <!> <!> <!> <!> <!> <div class="mt-8 flex gap-4"><!> <!></div> <div class="mt-4 rounded bg-gray-50 p-4 dark:bg-gray-800"><!> <!> <!> <!></div>`, 1);

export default function ProgressBasic($$anchor) {
	let current = $.state(1);

	const steps = [
		{ id: 1, status: undefined // Will be auto-determined
		 },
		{ id: 2, status: undefined },
		{ id: 3, status: undefined },
		{ id: 4, status: undefined }
	];

	// Optional: Handle step changes
	function handleStepChange(event) {
		console.log(`Moved from step ${event.last} to step ${event.current}`);

		// You can add validation here
	}

	var fragment = root_2();
	var node = $.first_child(fragment);

	Heading(node, {
		tag: 'h3',
		class: 'mb-2 text-lg font-semibold',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Example 1: Basic clickable progress stepper with numbers');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	ProgressStepper(node_1, {
		get steps() {
			return steps;
		},
		onStepClick: handleStepChange,
		get current() {
			return $.get(current);
		},

		set current($$value) {
			$.set(current, $$value, true);
		}
	});

	var node_2 = $.sibling(node_1, 2);

	Heading(node_2, {
		tag: 'h3',
		class: 'mt-8 mb-2 text-lg font-semibold',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Example 2: Non-clickable stepper');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 2);

	ProgressStepper(node_3, {
		get steps() {
			return steps;
		},
		clickable: false,
		get current() {
			return $.get(current);
		},

		set current($$value) {
			$.set(current, $$value, true);
		}
	});

	var node_4 = $.sibling(node_3, 2);

	Heading(node_4, {
		tag: 'h3',
		class: 'mt-8 mb-2 text-lg font-semibold',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('Example 3: Without checkmarks (shows numbers for all steps)');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	var node_5 = $.sibling(node_4, 2);

	ProgressStepper(node_5, {
		get steps() {
			return steps;
		},
		showCheckmarkForCompleted: false,
		get current() {
			return $.get(current);
		},

		set current($$value) {
			$.set(current, $$value, true);
		}
	});

	var div = $.sibling(node_5, 2);
	var node_6 = $.child(div);

	{
		let $0 = $.derived(() => $.get(current) === 0);

		Button(node_6, {
			onclick: () => $.set(current, Math.max(0, $.get(current) - 1), true),
			get disabled() {
				return $.get($0);
			},
			class: 'rounded bg-gray-500 px-4 py-2 disabled:opacity-50',
			children: ($$anchor, $$slotProps) => {
				$.next();

				var text_3 = $.text('Previous');

				$.append($$anchor, text_3);
			},
			$$slots: { default: true }
		});
	}

	var node_7 = $.sibling(node_6, 2);

	{
		let $0 = $.derived(() => $.get(current) === steps.length);

		Button(node_7, {
			onclick: () => $.set(current, Math.min(steps.length, $.get(current) + 1), true),
			get disabled() {
				return $.get($0);
			},
			class: 'rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50',
			children: ($$anchor, $$slotProps) => {
				$.next();

				var text_4 = $.text('Next');

				$.append($$anchor, text_4);
			},
			$$slots: { default: true }
		});
	}

	$.reset(div);

	var div_1 = $.sibling(div, 2);
	var node_8 = $.child(div_1);

	Heading(node_8, {
		tag: 'h4',
		class: 'font-bold',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_5 = $.text('Current State');

			$.append($$anchor, text_5);
		},
		$$slots: { default: true }
	});

	var node_9 = $.sibling(node_8, 2);

	P(node_9, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var text_6 = $.sibling($.first_child(fragment_1));

			$.template_effect(() => $.set_text(text_6, ` ${$.get(current) ?? ''}`));
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_10 = $.sibling(node_9, 2);

	P(node_10, {
		children: ($$anchor, $$slotProps) => {
			var fragment_2 = root_1();
			var text_7 = $.sibling($.first_child(fragment_2));

			$.template_effect(() => $.set_text(text_7, ` Step ${$.get(current) ?? ''} of ${steps.length ?? ''}`));
			$.append($$anchor, fragment_2);
		},
		$$slots: { default: true }
	});

	var node_11 = $.sibling(node_10, 2);

	P(node_11, {
		class: 'mt-2 text-xs text-gray-500 dark:text-gray-400',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_8 = $.text('Note: current=0 means no step is active, current=1 is the first step, current=2 is the second step, etc.');

			$.append($$anchor, text_8);
		},
		$$slots: { default: true }
	});

	$.reset(div_1);
	$.append($$anchor, fragment);
}