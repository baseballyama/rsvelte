import * as $ from 'svelte/internal/server';
import { Badge } from "$lib/registry/ui/badge/index.js";
import { Spinner } from "$lib/registry/ui/spinner/index.js";

export default function Spinner_badge_demo($$renderer) {
	$$renderer.push(`<div class="flex items-center gap-2">`);

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
			$$renderer.push(`<!----> Loading`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div>`);
}