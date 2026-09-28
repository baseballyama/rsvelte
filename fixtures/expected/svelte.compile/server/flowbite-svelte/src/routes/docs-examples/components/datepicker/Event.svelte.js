import * as $ from 'svelte/internal/server';
import { Datepicker } from "flowbite-svelte";

export default function Event($$renderer) {
	function handleDateSelect(detail) {
		console.log("Selected date:", detail);
	}

	$$renderer.push(`<div class="mb-64 md:w-1/2">`);
	Datepicker($$renderer, { onselect: handleDateSelect });
	$$renderer.push(`<!----></div>`);
}