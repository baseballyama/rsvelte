import * as $ from 'svelte/internal/server';
import { Spinner } from "$lib/registry/ui/spinner/index.js";

export default function Spinner_color_demo($$renderer) {
	$$renderer.push(`<div class="flex items-center gap-6">`);
	Spinner($$renderer, { class: 'size-6 text-red-500' });
	$$renderer.push(`<!----> `);
	Spinner($$renderer, { class: 'size-6 text-green-500' });
	$$renderer.push(`<!----> `);
	Spinner($$renderer, { class: 'size-6 text-blue-500' });
	$$renderer.push(`<!----> `);
	Spinner($$renderer, { class: 'size-6 text-yellow-500' });
	$$renderer.push(`<!----> `);
	Spinner($$renderer, { class: 'size-6 text-purple-500' });
	$$renderer.push(`<!----></div>`);
}