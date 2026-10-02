import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Stepper, P, Heading } from "flowbite-svelte";
import { CheckOutline, UserCircleOutline, BadgeCheckOutline } from "flowbite-svelte-icons";

var root = $.from_html(`<!> <!> <!>`, 1);

export default function DefaultOverride($$anchor) {
	let current = $.state(1);
	var fragment = root();
	var node = $.first_child(fragment);

	Heading(node, {
		tag: 'h3',
		class: 'mb-2 text-lg font-semibold',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Example 5: With custom status override');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	P(node_1, {
		class: 'mb-2 text-sm text-gray-600',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('These statuses are hardcoded and ignore the `current` prop');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	{
		let $0 = $.derived(() => [
			{
				label: "Personal",
				description: "Info",
				status: "completed",
				icon: UserCircleOutline
			},

			{
				label: "Account",
				description: "Info",
				status: "current",
				icon: BadgeCheckOutline
			},
			{ label: "Confirmation", status: "pending", icon: CheckOutline }
		]);

		Stepper(node_2, {
			get steps() {
				return $.get($0);
			},
			clickable: false,
			get current() {
				return $.get(current);
			},

			set current($$value) {
				$.set(current, $$value, true);
			}
		});
	}

	$.append($$anchor, fragment);
}