import * as $ from 'svelte/internal/server';
import { FloatingLabelInput } from "flowbite-svelte";

export default function Event($$renderer) {
	FloatingLabelInput($$renderer, {
		clearable: true,
		clearableOnClick: () => {
			alert("Clicked clear button");
		},
		variant: 'filled',
		id: 'event_filled',
		name: 'event_illed',
		type: 'text',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Floating filled`);
		},
		$$slots: { default: true }
	});
}