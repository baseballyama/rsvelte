import * as $ from 'svelte/internal/server';
import { PersistedState } from "runed";
import { Button, DemoContainer } from "@svecodocs/kit";

export default function Persisted_state($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const count = new PersistedState("persisted-state-demo-count", 0);

		DemoContainer($$renderer, {
			class: 'flex flex-col gap-4',
			children: ($$renderer) => {
				$$renderer.push(`<div class="flex items-center gap-3">`);

				Button($$renderer, {
					variant: 'brand',
					size: 'sm',
					onclick: () => count.current++,
					children: ($$renderer) => {
						$$renderer.push(`<!---->Increment`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Button($$renderer, {
					variant: 'brand',
					size: 'sm',
					onclick: () => count.current--,
					children: ($$renderer) => {
						$$renderer.push(`<!---->Decrement`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Button($$renderer, {
					variant: 'ghost',
					size: 'sm',
					onclick: () => count.current = 0,
					children: ($$renderer) => {
						$$renderer.push(`<!---->Reset`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div> <pre class="bg-transparent p-0 font-mono">Count: ${$.escape(`${count.current}`)}</pre>`);
			},
			$$slots: { default: true }
		});
	});
}