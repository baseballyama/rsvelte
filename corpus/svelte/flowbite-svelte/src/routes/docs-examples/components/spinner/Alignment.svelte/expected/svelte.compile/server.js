import * as $ from 'svelte/internal/server';
import { Spinner } from "flowbite-svelte";

export default function Alignment($$renderer) {
	$$renderer.push(`<div class="text-left">`);
	Spinner($$renderer, {});
	$$renderer.push(`<!----></div> <div class="text-center">`);
	Spinner($$renderer, {});
	$$renderer.push(`<!----></div> <div class="text-right">`);
	Spinner($$renderer, {});
	$$renderer.push(`<!----></div>`);
}