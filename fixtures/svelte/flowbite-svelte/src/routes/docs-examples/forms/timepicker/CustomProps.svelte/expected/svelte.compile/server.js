import * as $ from 'svelte/internal/server';
import { Label, Timepicker } from "flowbite-svelte";

export default function CustomProps($$renderer) {
	Label($$renderer, {
		for: 'appointment-time',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Choose appointment time:`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Timepicker($$renderer, {
		id: 'appointment-time',
		value: '09:00',
		min: '08:00',
		max: '18:00'
	});

	$$renderer.push(`<!---->`);
}