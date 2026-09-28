import * as $ from 'svelte/internal/server';
import { Range, Label } from "flowbite-svelte";

export default function Disabled($$renderer) {
	Label($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->Default range`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);
	Range($$renderer, { id: 'range-disabled', disabled: true, value: 50 });
	$$renderer.push(`<!---->`);
}