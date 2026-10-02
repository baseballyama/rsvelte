import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ProgressStepper, Button, P, Heading, List, Li, Span } from "flowbite-svelte";
import { HomeOutline, CartOutline, DollarOutline, TruckOutline } from "flowbite-svelte-icons";

var root = $.from_html(`<strong> </strong> `, 1);
var root_1 = $.from_html(` <!>`, 1);
var root_2 = $.from_html(`<!> <!> <div class="mt-8 flex gap-4"><!> <!></div> <div class="mt-4 rounded bg-gray-50 p-4 dark:bg-gray-800"><!> <!> <!> <!></div>`, 1);

export default function ProgressOverride($$anchor) {
	let current = $.state(1 // 1-based: 0=none, 1=first step, 2=second step, etc.
	);

	// Example: Manual status override
	// This is useful when you want specific steps to have certain states
	// regardless of the current position
	const steps = [
		{
			id: 1,
			icon: HomeOutline,
			status: "completed", // Explicitly completed
			iconClass: "h-5 w-5 lg:h-6 lg:w-6"
		},

		{
			id: 2,
			icon: CartOutline,
			// status will be auto-determined based on current
			iconClass: "h-5 w-5 lg:h-6 lg:w-6"
		},

		{
			id: 3,
			icon: DollarOutline,
			// status will be auto-determined based on current
			iconClass: "h-5 w-5 lg:h-6 lg:w-6"
		},

		{
			id: 4,
			icon: TruckOutline,
			status: "pending", // Force pending regardless of current
			iconClass: "h-5 w-5 lg:h-6 lg:w-6"
		}
	];

	const stepLabels = ["Browse Products", "Shopping Cart", "Payment", "Delivery"];
	var fragment = root_2();
	var node = $.first_child(fragment);

	Heading(node, {
		tag: 'h3',
		class: 'mb-2 text-lg font-semibold',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Progress Stepper with Status Override');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	ProgressStepper(node_1, {
		get steps() {
			return steps;
		},

		get current() {
			return $.get(current);
		},

		set current($$value) {
			$.set(current, $$value, true);
		}
	});

	var div = $.sibling(node_1, 2);
	var node_2 = $.child(div);

	{
		let $0 = $.derived(() => $.get(current) === 0);

		Button(node_2, {
			onclick: () => $.set(current, Math.max(0, $.get(current) - 1), true),
			get disabled() {
				return $.get($0);
			},
			class: 'rounded bg-gray-500 px-4 py-2 disabled:opacity-50',
			children: ($$anchor, $$slotProps) => {
				$.next();

				var text_1 = $.text('Previous');

				$.append($$anchor, text_1);
			},
			$$slots: { default: true }
		});
	}

	var node_3 = $.sibling(node_2, 2);

	{
		let $0 = $.derived(() => $.get(current) === steps.length);

		Button(node_3, {
			onclick: () => $.set(current, Math.min(steps.length, $.get(current) + 1), true),
			get disabled() {
				return $.get($0);
			},
			class: 'rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50',
			children: ($$anchor, $$slotProps) => {
				$.next();

				var text_2 = $.text('Next');

				$.append($$anchor, text_2);
			},
			$$slots: { default: true }
		});
	}

	$.reset(div);

	var div_1 = $.sibling(div, 2);
	var node_4 = $.child(div_1);

	Heading(node_4, {
		tag: 'h4',
		class: 'mb-2 font-bold',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_3 = $.text('Current Step');

			$.append($$anchor, text_3);
		},
		$$slots: { default: true }
	});

	var node_5 = $.sibling(node_4, 2);

	P(node_5, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var strong = $.first_child(fragment_1);
			var text_4 = $.only_child(strong, true);
			var text_5 = $.sibling(strong);

			$.template_effect(() => {
				$.set_text(text_4, $.get(current) === 0 ? "None (all pending)" : stepLabels[$.get(current) - 1]);
				$.set_text(text_5, ` (Step ${$.get(current) ?? ''} of ${steps.length ?? ''})`);
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_6 = $.sibling(node_5, 2);

	Heading(node_6, {
		tag: 'h4',
		class: 'mt-4 mb-2 font-bold',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_6 = $.text('Step Statuses');

			$.append($$anchor, text_6);
		},
		$$slots: { default: true }
	});

	var node_7 = $.sibling(node_6, 2);

	List(node_7, {
		tag: 'ul',
		class: 'space-y-1 text-gray-500 dark:text-gray-400',
		children: ($$anchor, $$slotProps) => {
			var fragment_2 = $.comment();
			var node_8 = $.first_child(fragment_2);

			$.each(node_8, 17, () => steps, $.index, ($$anchor, step, i) => {
				Li($$anchor, {
					children: ($$anchor, $$slotProps) => {
						$.next();

						var fragment_4 = root_1();
						var text_7 = $.first_child(fragment_4);
						var node_9 = $.sibling(text_7);

						Span(node_9, {
							class: 'font-mono',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_8 = $.text();

								$.template_effect(() => $.set_text(text_8, $.get(step).status ?? (i + 1 < $.get(current)
									? "completed"
									: i + 1 === $.get(current) ? "current" : "pending")));

								$.append($$anchor, text_8);
							},
							$$slots: { default: true }
						});

						$.template_effect(() => $.set_text(text_7, `${stepLabels[i] ?? ''}: `));
						$.append($$anchor, fragment_4);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_2);
		},
		$$slots: { default: true }
	});

	$.reset(div_1);
	$.append($$anchor, fragment);
}