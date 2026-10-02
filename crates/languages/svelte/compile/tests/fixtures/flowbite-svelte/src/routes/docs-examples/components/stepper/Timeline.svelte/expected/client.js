import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { TimelineStepper } from "flowbite-svelte";

export default function Timeline($$anchor) {
	TimelineStepper($$anchor, {
		steps: [
			{
				label: "Personal Info",
				description: "Step details here",
				status: "completed"
			},

			{
				label: "Account Info",
				description: "Step details here",
				status: "current"
			},

			{
				label: "Review",
				description: "Step details here",
				status: "pending"
			},

			{
				label: "Confirmation",
				description: "Step details here",
				status: "pending"
			}
		]
	});
}