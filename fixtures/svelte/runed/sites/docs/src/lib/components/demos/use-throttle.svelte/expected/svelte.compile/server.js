import * as $ from 'svelte/internal/server';
import { useThrottle } from "runed";
import { Label, Input, DemoContainer } from "@svecodocs/kit";

export default function Use_throttle($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let search = "";
		let throttledSearch = "";
		let durationMs = 1000;
		const setThrottledSearch = useThrottle(() => throttledSearch = search, () => durationMs);
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			DemoContainer($$renderer, {
				class: 'flex flex-col gap-4',
				children: ($$renderer) => {
					var bind_get = () => search;

					var bind_set = (v) => {
						search = v;
						setThrottledSearch();
					};

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
						get value() {
							return bind_get();
						},

						set value($$value) {
							bind_set($$value);
						},
						placeholder: 'Search the best utilities for Svelte 5'
					});

					$$renderer.push(`<!----></div> <p>`);

					if (throttledSearch) {
						$$renderer.push(`<!--[0-->You searched for: <b>${$.escape(throttledSearch)}</b>`);
					} else {
						$$renderer.push(`<!--[-1-->Search for something above!`);
					}

					$$renderer.push(`<!--]--></p>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <div class="h-1 w-screen"></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}