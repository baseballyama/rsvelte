import * as $ from 'svelte/internal/server';
import { Label, Checkbox } from "flowbite-svelte";

export default function Default($$renderer) {
	Label($$renderer, {
		color: 'red',
		class: 'mt-4 flex items-center font-bold italic',
		children: ($$renderer) => {
			Checkbox($$renderer, { classes: { div: "me-2" } });
			$$renderer.push(`<!----> Your Label`);
		},
		$$slots: { default: true }
	});
}