import * as $ from 'svelte/internal/server';
import { Throttled } from "runed";
import { Label, Input, DemoContainer } from "@svecodocs/kit";

export default function Throttled_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let search = "";
		let durationMs = 1000;
		const throttledSearch = new Throttled(() => search, () => durationMs);
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			DemoContainer($$renderer, {
				class: 'flex flex-col gap-4',
				children: ($$renderer) => {
					$$renderer.push(`<div class="flex flex-col gap-1.5">`);

					Label($$renderer, {
						for: 'duration',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Throttle duration (ms)`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Input($$renderer, {
						id: 'duration',
						type: 'number',
						get value() {
							return durationMs;
						},

						set value($$value) {
							durationMs = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----></div> <div class="flex flex-col gap-1.5">`);

					Label($$renderer, {
						for: 'search',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Search`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

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

					$$renderer.push(`<!----></div> <p>`);

					if (throttledSearch.current) {
						$$renderer.push(`<!--[0-->You searched for: <b>${$.escape(throttledSearch.current)}</b>`);
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