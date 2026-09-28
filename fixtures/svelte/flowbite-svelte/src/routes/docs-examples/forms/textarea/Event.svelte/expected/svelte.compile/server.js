import * as $ from 'svelte/internal/server';
import { Textarea, Label } from "flowbite-svelte";

export default function Event($$renderer) {
	Label($$renderer, {
		for: 'textarea-id',
		class: 'mb-2',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Your message`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Textarea($$renderer, {
		clearable: true,
		clearableOnClick: () => {
			alert("Clicked clear button!");
		},
		class: 'textarea-event w-full',
		placeholder: 'Your message',
		rows: 4,
		name: 'message'
	});

	$$renderer.push(`<!---->`);
}