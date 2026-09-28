import * as $ from 'svelte/internal/server';
import { Spinner } from "$lib/registry/ui/spinner/index.js";

export default function Spinner_size_demo($$renderer) {
	$$renderer.push(`<div class="flex items-center gap-6">`);
	Spinner($$renderer, { class: 'size-3' });
	$$renderer.push(`<!----> `);
	Spinner($$renderer, { class: 'size-4' });
	$$renderer.push(`<!----> `);
	Spinner($$renderer, { class: 'size-6' });
	$$renderer.push(`<!----> `);
	Spinner($$renderer, { class: 'size-8' });
	$$renderer.push(`<!----></div>`);
}