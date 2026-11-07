import * as $ from 'svelte/internal/server';
import { Slider } from "$lib/registry/ui/slider/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Slider_basic($$renderer) {
	Example($$renderer, {
		title: 'Basic',
		children: ($$renderer) => {
			Slider($$renderer, { type: 'single', value: 50, max: 100, step: 1 });
		},
		$$slots: { default: true }
	});
}