import * as $ from 'svelte/internal/server';
import { Fileupload, Label, Helper } from "flowbite-svelte";

export default function HelperText($$renderer) {
	Label($$renderer, {
		for: 'with_helper',
		class: 'pb-2',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Upload file`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);
	Fileupload($$renderer, { id: 'with_helper', class: 'mb-2' });
	$$renderer.push(`<!----> `);

	Helper($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->SVG, PNG, JPG or GIF (MAX. 800x400px).`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}