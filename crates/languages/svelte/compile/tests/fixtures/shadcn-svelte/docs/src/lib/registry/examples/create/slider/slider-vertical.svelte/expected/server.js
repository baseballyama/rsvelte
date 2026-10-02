import * as $ from 'svelte/internal/server';
import { Slider } from "$lib/registry/ui/slider/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Slider_vertical($$renderer) {
	Example($$renderer, {
		title: 'Vertical',
		children: ($$renderer) => {
			$$renderer.push(`<div class="flex items-center gap-6">`);

			Slider($$renderer, {
				type: 'single',
				value: 50,
				max: 100,
				step: 1,
				orientation: 'vertical',
				class: 'h-40'
			});

			$$renderer.push(`<!----> `);

			Slider($$renderer, {
				type: 'single',
				value: 25,
				max: 100,
				step: 1,
				orientation: 'vertical',
				class: 'h-40'
			});

			$$renderer.push(`<!----></div>`);
		},
		$$slots: { default: true }
	});
}