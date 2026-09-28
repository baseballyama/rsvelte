import * as $ from 'svelte/internal/server';
import { Fileupload, Label } from "flowbite-svelte";

export default function Sizes($$renderer) {
	Label($$renderer, {
		class: 'pb-2',
		for: 'small_size',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Small file input`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);
	Fileupload($$renderer, { id: 'small_size', size: 'sm' });
	$$renderer.push(`<!----> `);

	Label($$renderer, {
		class: 'py-2',
		for: 'default_size',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Default size`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);
	Fileupload($$renderer, { id: 'default_size' });
	$$renderer.push(`<!----> `);

	Label($$renderer, {
		class: 'py-2',
		for: 'larg_size',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Large file input`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);
	Fileupload($$renderer, { id: 'larg_size', size: 'lg' });
	$$renderer.push(`<!---->`);
}