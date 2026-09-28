import * as $ from 'svelte/internal/server';
import { Range, Label } from "flowbite-svelte";

export default function Default($$renderer) {
	Label($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->Default range`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);
	Range($$renderer, { id: 'range1', value: 50 });
	$$renderer.push(`<!---->`);
}