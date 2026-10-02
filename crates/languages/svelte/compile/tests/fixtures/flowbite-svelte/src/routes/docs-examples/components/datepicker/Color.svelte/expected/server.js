import * as $ from 'svelte/internal/server';
import { Datepicker } from "flowbite-svelte";

export default function Color($$renderer) {
	$$renderer.push(`<div class="mb-64 md:w-1/2">`);

	Datepicker($$renderer, {
		color: 'blue',
		classes: {
			polite: "hover:text-blue-700!",
			dayButton: "hover:text-blue-400",
			titleVariant: "text-blue-800",
			monthButton: "text-blue-700"
		},
		title: 'Select your preferred date',
		monthBtnSelected: 'bg-blue-200'
	});

	$$renderer.push(`<!----></div>`);
}