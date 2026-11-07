import * as $ from 'svelte/internal/server';
import { Badge } from "$lib/registry/ui/badge/index.js";
import { Spinner } from "$lib/registry/ui/spinner/index.js";

export default function Spinner_badge($$renderer) {
	$$renderer.push(`<div class="flex items-center gap-4 [--radius:1.2rem]">`);

	Badge($$renderer, {
		children: ($$renderer) => {
			Spinner($$renderer, {});
			$$renderer.push(`<!----> Syncing`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Badge($$renderer, {
		variant: 'secondary',
		children: ($$renderer) => {
			Spinner($$renderer, {});
			$$renderer.push(`<!----> Updating`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Badge($$renderer, {
		variant: 'outline',
		children: ($$renderer) => {
			Spinner($$renderer, {});
			$$renderer.push(`<!----> Processing`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div>`);
}