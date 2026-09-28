import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { VerticalStepper } from "flowbite-svelte";

export default function Vertical($$anchor) {
	VerticalStepper($$anchor, {
		steps: [
			{ id: 1, label: "User info", status: "completed" },
			{ id: 2, label: "Account info", status: "completed" },
			{ id: 3, label: "Social accounts", status: "current" },
			{ id: 4, label: "Review", status: "pending" },
			{ id: 5, label: "Confirmation", status: "pending" }
		]
	});
}