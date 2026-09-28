import * as $ from 'svelte/internal/server';
import { BreadcrumbStepper } from "flowbite-svelte";

export default function Breadcrumb($$renderer) {
	BreadcrumbStepper($$renderer, {
		steps: [
			{
				id: 1,
				label: "Personal",
				shortLabel: "Info",
				status: "completed"
			},

			{
				id: 2,
				label: "Account",
				shortLabel: "Info",
				status: "current"
			},
			{ id: 3, label: "Review", status: "pending" }
		]
	});
}