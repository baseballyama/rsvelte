import * as $ from 'svelte/internal/server';
import { Button, breakpoints } from "carbon-components-svelte";
import { Airplane } from "carbon-pictograms-svelte";

export default function _page($$renderer) {
	Button($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->Primary button`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);
	Airplane($$renderer, {});
	$$renderer.push(`<!----> ${$.escape(JSON.stringify(breakpoints))}`);
}