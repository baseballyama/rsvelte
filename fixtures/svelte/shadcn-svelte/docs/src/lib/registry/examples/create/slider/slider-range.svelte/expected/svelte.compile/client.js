import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Slider } from "$lib/registry/ui/slider/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Slider_range($$anchor) {
	Example($$anchor, {
		title: 'Range',
		children: ($$anchor, $$slotProps) => {
			Slider($$anchor, { type: 'multiple', value: [25, 50], max: 100, step: 5 });
		},
		$$slots: { default: true }
	});
}