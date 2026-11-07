import * as $ from 'svelte/internal/server';
import Portal from "carbon-components-svelte/Portal/Portal.svelte";

export default function Portal_multiple_test($$renderer) {
	Portal($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->Portal content 1`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Portal($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->Portal content 2`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Portal($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->Portal content 3`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}