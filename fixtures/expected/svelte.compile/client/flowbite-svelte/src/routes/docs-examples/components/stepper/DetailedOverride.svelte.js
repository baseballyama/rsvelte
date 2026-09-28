import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { DetailedStepper, P, Heading } from "flowbite-svelte";
import { BellOutline, ClipboardOutline, CogOutline } from "flowbite-svelte-icons";

var root = $.from_html(`<!> <!> <!>`, 1);

export default function DetailedOverride($$anchor) {
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
				id: 1,
				label: "Step 1",
				description: "Done",
				status: "completed",
				icon: BellOutline
			},

			{
				id: 2,
				label: "Step 2",
				description: "In progress",
				status: "current",
				icon: ClipboardOutline
			},

			{
				id: 3,
				label: "Step 3",
				description: "Pending",
				status: "pending",
				icon: CogOutline
			}
		]);

		DetailedStepper(node_2, {
			get steps() {
				return $.get($0);
			},
			clickable: false
		});
	}

	$.append($$anchor, fragment);
}