import * as $ from 'svelte/internal/server';
import { Stepper } from "flowbite-svelte";
import { CheckOutline } from "flowbite-svelte-icons";

export default function Default($$renderer) {
	Stepper($$renderer, {
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

	$$renderer.push(`<!----> `);

	Stepper($$renderer, {
		steps: [
			{
				label: "Personal",
				description: "Info",
				status: "completed",
				icon: CheckOutline
			},
			{ label: "Account", description: "Info", status: "current" },
			{ label: "Confirmation", status: "pending" }
		]
	});

	$$renderer.push(`<!---->`);
}