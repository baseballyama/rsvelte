import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Stepper } from "flowbite-svelte";
import { CheckOutline } from "flowbite-svelte-icons";

var root = $.from_html(`<!> <!>`, 1);

export default function Default($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	Stepper(node, {
		steps: [
			{
				id: 1,
				label: "Personal",
				description: "Info",
				status: "completed"
			},

			{
				id: 2,
				label: "Account",
				description: "Info",
				status: "current"
			},
			{ id: 3, label: "Confirmation", status: "pending" }
		]
	});

	var node_1 = $.sibling(node, 2);

	{
		let $0 = $.derived(() => [
			{
				label: "Personal",
				description: "Info",
				status: "completed",
				icon: CheckOutline
			},
			{ label: "Account", description: "Info", status: "current" },
			{ label: "Confirmation", status: "pending" }
		]);

		Stepper(node_1, {
			get steps() {
				return $.get($0);
			}
		});
	}

	$.append($$anchor, fragment);
}