import * as $ from 'svelte/internal/server';
import { Fileupload, Label } from "flowbite-svelte";

export default function Disabled($$renderer) {
	Label($$renderer, {
		for: 'with_helper',
		class: 'pb-2',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Upload file`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);
	Fileupload($$renderer, { disabled: true, id: 'with_helper', class: 'mb-2' });
	$$renderer.push(`<!---->`);
}