import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Slider } from "$lib/registry/ui/slider/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Slider_basic($$anchor) {
	Example($$anchor, {
		title: 'Basic',
		children: ($$anchor, $$slotProps) => {
			Slider($$anchor, { type: 'single', value: 50, max: 100, step: 1 });
		},
		$$slots: { default: true }
	});
}