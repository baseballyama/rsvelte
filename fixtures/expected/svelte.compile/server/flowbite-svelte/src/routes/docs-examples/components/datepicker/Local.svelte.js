import * as $ from 'svelte/internal/server';
import { Datepicker } from "flowbite-svelte";

export default function Local($$renderer) {
	$$renderer.push(`<div class="mb-64 md:w-1/2">`);
	Datepicker($$renderer, { locale: 'de-DE', translationLocale: 'en-US' });
	$$renderer.push(`<!----></div>`);
}