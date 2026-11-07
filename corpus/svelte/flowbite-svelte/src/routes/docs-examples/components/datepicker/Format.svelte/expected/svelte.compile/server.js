import * as $ from 'svelte/internal/server';
import { Datepicker } from "flowbite-svelte";

export default function Format($$renderer) {
	$$renderer.push(`<div class="mb-64 md:w-1/2">`);

	Datepicker($$renderer, {
		dateFormat: { year: "numeric", month: "short", day: "2-digit" }
	});

	$$renderer.push(`<!----></div>`);
}