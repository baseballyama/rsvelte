import * as $ from 'svelte/internal/server';
import { Button } from "@svar-ui/svelte-core";

export default function Overlay($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { onaction } = $$props;

		function showData() {
			onaction && onaction({ action: "overlay-button-click", data: { show: true } });
		}

		$$renderer.push(`<div>Here is a component example</div> <div>Click the button to see the data</div> `);

		Button($$renderer, {
			type: 'primary',
			onclick: showData,
			children: ($$renderer) => {
				$$renderer.push(`<!---->Show data`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!---->`);
	});
}