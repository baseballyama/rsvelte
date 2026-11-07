import * as $ from 'svelte/internal/server';
import { Range, Label } from "flowbite-svelte";

export default function Sizes($$renderer) {
	Label($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->Small range`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);
	Range($$renderer, { id: 'small-range', size: 'sm', value: 50 });
	$$renderer.push(`<!----> `);

	Label($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->Default range`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);
	Range($$renderer, { id: 'default-range', size: 'md', value: 50 });
	$$renderer.push(`<!----> `);

	Label($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->Large range`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);
	Range($$renderer, { id: 'large-range', size: 'lg', value: 50 });
	$$renderer.push(`<!---->`);
}