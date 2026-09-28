import * as $ from 'svelte/internal/server';
import { Progress } from "$lib/registry/ui/progress/index.js";
import { Slider } from "$lib/registry/ui/slider/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Progress_controlled($$renderer) {
	let value = 50;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Example($$renderer, {
			title: 'Controlled',
			children: ($$renderer) => {
				$$renderer.push(`<div class="flex w-full flex-col gap-4">`);
				Progress($$renderer, { value, class: 'w-full' });
				$$renderer.push(`<!----> `);

				Slider($$renderer, {
					type: 'single',
					min: 0,
					max: 100,
					step: 1,
					get value() {
						return value;
					},

					set value($$value) {
						value = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----></div>`);
			},
			$$slots: { default: true }
		});
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}