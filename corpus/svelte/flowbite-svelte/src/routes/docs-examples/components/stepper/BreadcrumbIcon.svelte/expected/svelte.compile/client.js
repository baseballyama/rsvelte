import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { BreadcrumbStepper, Button, P, Heading } from "flowbite-svelte";

import {
	UserCircleOutline,
	CogOutline,
	EyeOutline,
	CheckCircleOutline
} from "flowbite-svelte-icons";

var root = $.from_html(`<strong> </strong> `, 1);
var root_1 = $.from_html(`<!> <!> <!> <!> <div class="mt-8 flex gap-4"><!> <!></div> <div class="mt-4 rounded bg-gray-50 p-4 dark:bg-gray-800"><!> <!></div>`, 1);

export default function BreadcrumbIcon($$anchor) {
	let current = $.state(1);

	const steps = [
		{
			id: 1,
			label: "Personal",
			shortLabel: "Info",
			icon: UserCircleOutline,
			iconClass: "h-3 w-3"
		},

		{
			id: 2,
			label: "Settings",
			shortLabel: "Config",
			icon: CogOutline,
			iconClass: "h-3 w-3"
		},

		{
			id: 3,
			label: "Review",
			icon: EyeOutline,
			iconClass: "h-3 w-3"
		},

		{
			id: 4,
			label: "Complete",
			icon: CheckCircleOutline,
			iconClass: "h-3 w-3"
		}
	];

	var fragment = root_1();
	var node = $.first_child(fragment);

	Heading(node, {
		tag: 'h3',
		class: 'mb-4 text-lg font-semibold',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Breadcrumb Stepper with Custom Icons');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	BreadcrumbStepper(node_1, {
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

	var node_2 = $.sibling(node_1, 2);

	Heading(node_2, {
		tag: 'h3',
		class: 'mt-8 mb-4 text-lg font-semibold',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('With icons, no checkmarks (keeps custom icons for completed steps)');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 2);

	BreadcrumbStepper(node_3, {
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

	var div = $.sibling(node_3, 2);
	var node_4 = $.child(div);

	{
		let $0 = $.derived(() => $.get(current) === 0);

		Button(node_4, {
			onclick: () => $.set(current, Math.max(0, $.get(current) - 1), true),
			get disabled() {
				return $.get($0);
			},
			class: 'rounded bg-gray-500 px-4 py-2 disabled:opacity-50',
			children: ($$anchor, $$slotProps) => {
				$.next();

				var text_2 = $.text('Previous');

				$.append($$anchor, text_2);
			},
			$$slots: { default: true }
		});
	}

	var node_5 = $.sibling(node_4, 2);

	{
		let $0 = $.derived(() => $.get(current) === steps.length);

		Button(node_5, {
			onclick: () => $.set(current, Math.min(steps.length, $.get(current) + 1), true),
			get disabled() {
				return $.get($0);
			},
			class: 'rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50',
			children: ($$anchor, $$slotProps) => {
				$.next();

				var text_3 = $.text('Next');

				$.append($$anchor, text_3);
			},
			$$slots: { default: true }
		});
	}

	$.reset(div);

	var div_1 = $.sibling(div, 2);
	var node_6 = $.child(div_1);

	Heading(node_6, {
		tag: 'h4',
		class: 'font-bold',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_4 = $.text('Current Step');

			$.append($$anchor, text_4);
		},
		$$slots: { default: true }
	});

	var node_7 = $.sibling(node_6, 2);

	P(node_7, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var strong = $.first_child(fragment_1);
			var text_5 = $.only_child(strong, true);
			var text_6 = $.sibling(strong);

			$.template_effect(() => {
				$.set_text(text_5, $.get(current) === 0
					? "None (all pending)"
					: steps[$.get(current) - 1].label);

				$.set_text(text_6, ` (Step ${$.get(current) ?? ''} of ${steps.length ?? ''})`);
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.reset(div_1);
	$.append($$anchor, fragment);
}