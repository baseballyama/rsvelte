import * as $ from 'svelte/internal/server';
import { Progress } from "$lib/registry/ui/progress/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Progress_bar($$renderer) {
	Example($$renderer, {
		title: 'Progress Bar',
		children: ($$renderer) => {
			$$renderer.push(`<div class="flex w-full flex-col gap-4">`);
			Progress($$renderer, { value: 0 });
			$$renderer.push(`<!----> `);
			Progress($$renderer, { value: 25, class: 'w-full' });
			$$renderer.push(`<!----> `);
			Progress($$renderer, { value: 50 });
			$$renderer.push(`<!----> `);
			Progress($$renderer, { value: 75 });
			$$renderer.push(`<!----> `);
			Progress($$renderer, { value: 100 });
			$$renderer.push(`<!----></div>`);
		},
		$$slots: { default: true }
	});
}