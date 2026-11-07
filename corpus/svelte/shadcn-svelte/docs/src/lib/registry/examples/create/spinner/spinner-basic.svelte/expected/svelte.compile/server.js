import * as $ from 'svelte/internal/server';
import { Spinner } from "$lib/registry/ui/spinner/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Spinner_basic($$renderer) {
	Example($$renderer, {
		title: 'Basic',
		children: ($$renderer) => {
			$$renderer.push(`<div class="flex items-center gap-6">`);
			Spinner($$renderer, {});
			$$renderer.push(`<!----> `);
			Spinner($$renderer, { class: 'size-6' });
			$$renderer.push(`<!----></div>`);
		},
		$$slots: { default: true }
	});
}