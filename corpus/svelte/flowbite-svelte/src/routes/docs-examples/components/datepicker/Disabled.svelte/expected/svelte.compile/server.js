import * as $ from 'svelte/internal/server';
import { Datepicker } from "flowbite-svelte";

export default function Disabled($$renderer) {
	$$renderer.push(`<div class="mb-64 md:w-1/2">`);
	Datepicker($$renderer, { disabled: true });
	$$renderer.push(`<!----></div>`);
}