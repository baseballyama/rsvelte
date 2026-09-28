import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ProgressStepper } from "flowbite-svelte";
import { CheckOutline, UserSolid, CreditCardSolid } from "flowbite-svelte-icons";

var root = $.from_html(`<!> <!>`, 1);

export default function Progress($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	ProgressStepper(node, {
		steps: [
			{ status: "completed" },
			{ status: "current" },
			{ status: "pending" }
		]
	});

	var node_1 = $.sibling(node, 2);

	{
		let $0 = $.derived(() => [
			{ status: "completed", icon: CheckOutline },
			{ status: "current", icon: UserSolid },
			{ status: "pending", icon: CreditCardSolid }
		]);

		ProgressStepper(node_1, {
			get steps() {
				return $.get($0);
			}
		});
	}

	$.append($$anchor, fragment);
}