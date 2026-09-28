import * as $ from 'svelte/internal/server';
import { useInterval } from "runed";
import { Input, Label, Button, DemoContainer } from "@svecodocs/kit";

export default function Use_interval($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let intervalMs = 500;
		const interval = useInterval(() => intervalMs);
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			DemoContainer($$renderer, {
				class: 'flex flex-col gap-6',
				children: ($$renderer) => {
					$$renderer.push(`<div class="flex flex-col gap-2.5">`);

					Label($$renderer, {
						for: 'interval',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Interval duration (ms)`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Input($$renderer, {
						id: 'interval',
						type: 'number',
						min: '100',
						step: '100',
						get value() {
							return intervalMs;
						},

						set value($$value) {
							intervalMs = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----></div> <div class="flex items-center gap-4">`);

					Button($$renderer, {
						variant: 'brand',
						size: 'sm',
						onclick: interval.pause,
						disabled: !interval.isActive,
						children: ($$renderer) => {
							$$renderer.push(`<!---->Pause`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Button($$renderer, {
						variant: 'brand',
						size: 'sm',
						onclick: interval.resume,
						disabled: interval.isActive,
						children: ($$renderer) => {
							$$renderer.push(`<!---->Resume`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Button($$renderer, {
						variant: 'ghost',
						size: 'sm',
						onclick: interval.reset,
						children: ($$renderer) => {
							$$renderer.push(`<!---->Reset Counter`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----></div> <div class="flex flex-col gap-2"><p><strong>Counter:</strong> ${$.escape(interval.counter)}</p> <p><strong>Status:</strong> ${$.escape(interval.isActive ? "Running" : "Paused")}</p></div>`);
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