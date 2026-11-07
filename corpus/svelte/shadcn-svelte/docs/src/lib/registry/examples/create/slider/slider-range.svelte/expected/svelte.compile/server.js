import * as $ from 'svelte/internal/server';
import { Slider } from "$lib/registry/ui/slider/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Slider_range($$renderer) {
	Example($$renderer, {
		title: 'Range',
		children: ($$renderer) => {
			Slider($$renderer, { type: 'multiple', value: [25, 50], max: 100, step: 5 });
		},
		$$slots: { default: true }
	});
}