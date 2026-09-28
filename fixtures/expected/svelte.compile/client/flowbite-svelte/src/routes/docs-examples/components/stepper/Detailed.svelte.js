import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { DetailedStepper } from "flowbite-svelte";

export default function Detailed($$anchor) {
	DetailedStepper($$anchor, {
		steps: [
			{
				id: 1,
				label: "User info",
				description: "Step details here",
				status: "completed"
			},

			{
				id: 2,
				label: "Company info",
				description: "Step details here",
				status: "current"
			},

			{
				id: 3,
				label: "Payment info",
				description: "Step details here",
				status: "pending"
			}
		]
	});
}