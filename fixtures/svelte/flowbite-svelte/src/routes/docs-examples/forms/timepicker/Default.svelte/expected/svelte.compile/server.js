import * as $ from 'svelte/internal/server';
import { Label, Timepicker } from "flowbite-svelte";

export default function Default($$renderer) {
	Label($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->Select Time:`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);
	Timepicker($$renderer, {});
	$$renderer.push(`<!---->`);
}