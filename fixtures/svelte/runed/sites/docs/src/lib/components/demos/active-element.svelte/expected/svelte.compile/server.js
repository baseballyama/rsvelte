import * as $ from 'svelte/internal/server';
import { activeElement } from "runed";
import { DemoContainer } from "@svecodocs/kit";

export default function Active_element($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		DemoContainer($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<p>Currently active element: <code class="font-bold">${$.escape(activeElement.current?.localName ?? "No active element found")}</code></p>`);
			},
			$$slots: { default: true }
		});
	});
}