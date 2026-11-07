import * as $ from 'svelte/internal/server';
import { Portal } from "carbon-components-svelte";

export default function BasicPortal($$renderer) {
	$$renderer.push(`<div><div>This is rendered inside the div</div> <br/> `);

	Portal($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->This is rendered outside of the div`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div>`);
}