import * as $ from 'svelte/internal/server';
import { Previous } from "runed";
import { Button, DemoContainer } from "@svecodocs/kit";

export default function Previous_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let count = 0;
		const previous = new Previous(() => count);

		DemoContainer($$renderer, {
			children: ($$renderer) => {
				Button($$renderer, {
					variant: 'brand',
					onclick: () => count++,
					children: ($$renderer) => {
						$$renderer.push(`<!---->Count: ${$.escape(count)}`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> <pre class="m-0 mt-4 bg-transparent p-0 font-mono">Previous: ${$.escape(`${previous.current}`)}</pre>`);
			},
			$$slots: { default: true }
		});
	});
}