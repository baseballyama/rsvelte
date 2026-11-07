import * as $ from 'svelte/internal/server';
import "carbon-components-svelte/css/white.css";
import { Button, breakpoints } from "carbon-components-svelte";

export default function App($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		Button($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<!---->Primary button`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> ${$.escape(breakpoints.md)}`);
	});
}