import * as $ from 'svelte/internal/server';
import { Slider } from "$lib/registry/ui/slider/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Slider_multiple($$renderer) {
	Example($$renderer, {
		title: 'Multiple Thumbs',
		children: ($$renderer) => {
			Slider($$renderer, { type: 'multiple', value: [10, 20, 70], max: 100, step: 10 });
		},
		$$slots: { default: true }
	});
}