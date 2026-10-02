import * as $ from 'svelte/internal/server';
import { VerticalStepper } from "flowbite-svelte";

export default function Vertical($$renderer) {
	VerticalStepper($$renderer, {
		steps: [
			{ id: 1, label: "User info", status: "completed" },
			{ id: 2, label: "Account info", status: "completed" },
			{ id: 3, label: "Social accounts", status: "current" },
			{ id: 4, label: "Review", status: "pending" },
			{ id: 5, label: "Confirmation", status: "pending" }
		]
	});
}