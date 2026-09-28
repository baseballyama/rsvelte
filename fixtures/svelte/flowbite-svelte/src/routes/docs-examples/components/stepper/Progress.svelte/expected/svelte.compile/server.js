import * as $ from 'svelte/internal/server';
import { ProgressStepper } from "flowbite-svelte";
import { CheckOutline, UserSolid, CreditCardSolid } from "flowbite-svelte-icons";

export default function Progress($$renderer) {
	ProgressStepper($$renderer, {
		steps: [
			{ status: "completed" },
			{ status: "current" },
			{ status: "pending" }
		]
	});

	$$renderer.push(`<!----> `);

	ProgressStepper($$renderer, {
		steps: [
			{ status: "completed", icon: CheckOutline },
			{ status: "current", icon: UserSolid },
			{ status: "pending", icon: CreditCardSolid }
		]
	});

	$$renderer.push(`<!---->`);
}