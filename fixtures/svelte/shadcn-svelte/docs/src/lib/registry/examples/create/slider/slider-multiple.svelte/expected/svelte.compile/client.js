import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Slider } from "$lib/registry/ui/slider/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Slider_multiple($$anchor) {
	Example($$anchor, {
		title: 'Multiple Thumbs',
		children: ($$anchor, $$slotProps) => {
			Slider($$anchor, { type: 'multiple', value: [10, 20, 70], max: 100, step: 10 });
		},
		$$slots: { default: true }
	});
}