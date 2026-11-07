import * as $ from 'svelte/internal/server';
import { Debounced } from "runed";
import { DemoContainer, Input } from "@svecodocs/kit";

export default function Debounced_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let search = "";
		const debounced = new Debounced(() => search, 500);
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			DemoContainer($$renderer, {
				class: 'flex flex-col gap-4',
				children: ($$renderer) => {
					Input($$renderer, {
						placeholder: 'Search the best utilities for Svelte 5',
						get value() {
							return search;
						},

						set value($$value) {
							search = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----> <p>`);

					if (debounced.current) {
						$$renderer.push(`<!--[0-->You searched for: <b>${$.escape(debounced.current)}</b>`);
					} else {
						$$renderer.push(`<!--[-1-->Search for something above!`);
					}

					$$renderer.push(`<!--]--></p>`);
				},
				$$slots: { default: true }
			});
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}