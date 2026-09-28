import * as $ from 'svelte/internal/server';
import { Textarea, Label } from "flowbite-svelte";

export default function Clearable($$renderer) {
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
		id: 'textarea-clearable',
		placeholder: 'Your message',
		rows: 4,
		name: 'message',
		class: 'w-full'
	});

	$$renderer.push(`<!---->`);
}