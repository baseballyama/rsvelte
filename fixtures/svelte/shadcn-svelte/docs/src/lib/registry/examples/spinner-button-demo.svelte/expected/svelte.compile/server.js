import * as $ from 'svelte/internal/server';
import { Button } from "$lib/registry/ui/button/index.js";
import { Spinner } from "$lib/registry/ui/spinner/index.js";

export default function Spinner_button_demo($$renderer) {
	$$renderer.push(`<div class="flex flex-col items-center gap-4">`);

	Button($$renderer, {
		disabled: true,
		size: 'sm',
		children: ($$renderer) => {
			Spinner($$renderer, {});
			$$renderer.push(`<!----> Loading...`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		variant: 'outline',
		disabled: true,
		size: 'sm',
		children: ($$renderer) => {
			Spinner($$renderer, {});
			$$renderer.push(`<!----> Please wait`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		variant: 'secondary',
		disabled: true,
		size: 'sm',
		children: ($$renderer) => {
			Spinner($$renderer, {});
			$$renderer.push(`<!----> Processing`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div>`);
}