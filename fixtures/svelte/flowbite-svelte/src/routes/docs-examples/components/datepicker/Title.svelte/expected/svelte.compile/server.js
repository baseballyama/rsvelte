import * as $ from 'svelte/internal/server';
import { Datepicker } from "flowbite-svelte";

export default function Title($$renderer) {
	$$renderer.push(`<div class="mb-64 md:w-1/2">`);
	Datepicker($$renderer, { title: 'Select your preferred date' });
	$$renderer.push(`<!----></div>`);
}