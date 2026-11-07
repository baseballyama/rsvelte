import * as $ from 'svelte/internal/server';
import { useDebounce } from "runed";
import { Input, Label, Button, DemoContainer } from "@svecodocs/kit";

export default function Use_debounce($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let count = 0;
		let logged = "";
		let isFirstTime = true;
		let durationMs = 1000;

		const logCount = useDebounce(
			() => {
				if (isFirstTime) {
					isFirstTime = false;
					logged = `You pressed the button ${count} times!`;
				} else {
					logged = `You pressed the button ${count} times since last time!`;
				}

				count = 0;
			},
			() => durationMs
		);

		function ding() {
			count++;
			logCount();
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			DemoContainer($$renderer, {
				class: 'flex flex-col gap-6',
				children: ($$renderer) => {
					$$renderer.push(`<div class="flex flex-col gap-2.5">`);

					Label($$renderer, {
						for: 'duration',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Debounce duration (ms)`);
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

					$$renderer.push(`<!----></div> <div class="flex items-center gap-4">`);

					Button($$renderer, {
						variant: 'brand',
						size: 'sm',
						onclick: ding,
						children: ($$renderer) => {
							$$renderer.push(`<!---->DING DING DING`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Button($$renderer, {
						variant: 'ghost',
						size: 'sm',
						onclick: logCount.runScheduledNow,
						disabled: !logCount.pending,
						children: ($$renderer) => {
							$$renderer.push(`<!---->Run now`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Button($$renderer, {
						variant: 'ghost',
						size: 'sm',
						onclick: logCount.cancel,
						disabled: !logCount.pending,
						children: ($$renderer) => {
							$$renderer.push(`<!---->Cancel message`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----></div> <p class="mt-2">${$.escape(logged || "Press the button!")}</p>`);
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