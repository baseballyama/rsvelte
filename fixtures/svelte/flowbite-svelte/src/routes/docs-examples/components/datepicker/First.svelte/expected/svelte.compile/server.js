import * as $ from 'svelte/internal/server';
import { Datepicker } from "flowbite-svelte";

export default function First($$renderer) {
	$$renderer.push(`<div class="mb-64 md:w-1/2">`);
	Datepicker($$renderer, { firstDayOfWeek: 3 });
	$$renderer.push(`<!----></div>`);
}